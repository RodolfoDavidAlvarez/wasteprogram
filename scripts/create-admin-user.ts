/**
 * Script to create an admin user in Supabase Auth and link it to our database
 * Usage: npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/create-admin-user.ts
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = "ralvarez@soilseedandwater.com";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "ChangeMe123!";
  const name = "Rodolfo Alvarez";
  const phone = "+19285501649";

  console.log(`Creating admin user: ${email}`);

  try {
    // Check if user already exists in Supabase Auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    const existingUser = existingUsers.users.find((u) => u.email === email);

    let authUserId: string;

    if (existingUser) {
      console.log(`User ${email} already exists in Supabase Auth`);
      authUserId = existingUser.id;

      // Update password if needed (only if ADMIN_INITIAL_PASSWORD is set)
      if (process.env.ADMIN_INITIAL_PASSWORD) {
        console.log("Updating password...");
        const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
          password: password,
        });

        if (updateError) {
          console.error("Error updating password:", updateError);
        } else {
          console.log("Password updated successfully");
        }
      }
    } else {
      // Create new user in Supabase Auth
      console.log(`Creating new user in Supabase Auth...`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          role: "admin",
        },
      });

      if (createError) {
        console.error("Error creating user in Supabase Auth:", createError);
        throw createError;
      }

      authUserId = newUser.user.id;
      console.log(`User created in Supabase Auth with ID: ${authUserId}`);
    }

    // Create or update user in our database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        authUserId,
        name,
        role: "admin",
        phone,
      },
      create: {
        authUserId,
        email,
        name,
        role: "admin",
        phone,
      },
    });

    console.log(`User created/updated in database:`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      authUserId: user.authUserId,
    });

    console.log("\n✅ Admin user setup complete!");
    console.log(`\nLogin credentials:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`\n⚠️  Please change the password after first login.`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });


