const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        accountNumber: "SSW-ABC123",
        companyName: "Green Valley Farms",
        operationalContact: "John Smith",
        operationalEmail: "john@greenvalleyfarms.com",
        operationalPhone: "(555) 123-4567",
        billingContact: "Jane Smith",
        billingEmail: "billing@greenvalleyfarms.com",
        address: "1234 Farm Road",
        city: "Greenville",
        state: "CA",
        zipCode: "94000",
        tippingFeeRate: 45.00,
        notes: "Large organic farm, regular weekly pickups",
        status: "active",
      },
    }),
    prisma.client.create({
      data: {
        accountNumber: "SSW-DEF456",
        companyName: "Sunset Brewery Co",
        operationalContact: "Mike Johnson",
        operationalEmail: "mike@sunsetbrewery.com",
        operationalPhone: "(555) 234-5678",
        address: "567 Brew Street",
        city: "Hopsville",
        state: "CA",
        zipCode: "94001",
        tippingFeeRate: 40.00,
        notes: "Spent grain and brewing waste",
        status: "active",
      },
    }),
    prisma.client.create({
      data: {
        accountNumber: "SSW-GHI789",
        companyName: "Fresh Market Grocery",
        operationalContact: "Sarah Williams",
        operationalEmail: "sarah@freshmarket.com",
        operationalPhone: "(555) 345-6789",
        billingEmail: "ap@freshmarket.com",
        address: "890 Market Plaza",
        city: "Commerce City",
        state: "CA",
        zipCode: "94002",
        tippingFeeRate: 50.00,
        notes: "Expired produce and food waste",
        status: "active",
      },
    }),
    prisma.client.create({
      data: {
        accountNumber: "SSW-JKL012",
        companyName: "City Parks Department",
        operationalContact: "Tom Davis",
        operationalEmail: "tdavis@cityparks.gov",
        operationalPhone: "(555) 456-7890",
        address: "100 City Hall Way",
        city: "Greenville",
        state: "CA",
        zipCode: "94000",
        tippingFeeRate: 35.00,
        notes: "Green waste and yard trimmings from city parks",
        status: "active",
      },
    }),
  ])

  console.log(`Created ${clients.length} clients`)

  // Create sample intakes with various statuses
  const now = new Date()
  const intakes = []

  // Past received intakes (for metrics)
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 60) + 1
    const clientIndex = Math.floor(Math.random() * clients.length)
    const client = clients[clientIndex]
    const estimatedWeight = Math.round((Math.random() * 8 + 2) * 100) / 100
    const actualWeight = estimatedWeight + (Math.random() * 1 - 0.5)
    const scheduledDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const receivedDate = new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000)

    const wasteTypes = ["food_waste", "green_waste", "wood_chips", "brewery_grain", "expired_produce"]
    const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)]

    intakes.push(
      prisma.wasteIntake.create({
        data: {
          ticketNumber: `WI-${scheduledDate.getFullYear().toString().slice(-2)}${(scheduledDate.getMonth() + 1).toString().padStart(2, "0")}${scheduledDate.getDate().toString().padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          clientId: client.id,
          wasteType,
          estimatedWeight,
          actualWeight,
          packagingType: ["loose", "pallets", "totes", "bags"][Math.floor(Math.random() * 4)],
          deliveryType: Math.random() > 0.5 ? "client_delivery" : "ssw_pickup",
          scheduledDate,
          scheduledTimeWindow: ["8AM-10AM", "10AM-12PM", "12PM-2PM", "2PM-4PM"][Math.floor(Math.random() * 4)],
          status: "received",
          receivedAt: receivedDate,
          contaminationCertified: true,
          inspectionPassed: Math.random() > 0.1,
          contaminationFound: Math.random() < 0.1,
          tippingFeeRate: client.tippingFeeRate,
          totalCharge: actualWeight * client.tippingFeeRate,
          destinationSite: "Main Composting Facility",
          approvedBy: "Operations Team",
          approvedAt: new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000),
        },
      })
    )
  }

  // Upcoming scheduled intakes
  for (let i = 0; i < 5; i++) {
    const daysAhead = Math.floor(Math.random() * 14) + 1
    const clientIndex = Math.floor(Math.random() * clients.length)
    const client = clients[clientIndex]
    const estimatedWeight = Math.round((Math.random() * 8 + 2) * 100) / 100
    const scheduledDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    const wasteTypes = ["food_waste", "green_waste", "wood_chips", "brewery_grain"]
    const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)]

    intakes.push(
      prisma.wasteIntake.create({
        data: {
          ticketNumber: `WI-${scheduledDate.getFullYear().toString().slice(-2)}${(scheduledDate.getMonth() + 1).toString().padStart(2, "0")}${scheduledDate.getDate().toString().padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          clientId: client.id,
          wasteType,
          estimatedWeight,
          packagingType: ["loose", "pallets", "totes"][Math.floor(Math.random() * 3)],
          deliveryType: Math.random() > 0.5 ? "client_delivery" : "ssw_pickup",
          scheduledDate,
          scheduledTimeWindow: ["8AM-10AM", "10AM-12PM", "2PM-4PM"][Math.floor(Math.random() * 3)],
          status: ["approved", "scheduled"][Math.floor(Math.random() * 2)],
          contaminationCertified: true,
          tippingFeeRate: client.tippingFeeRate,
          pickupAddress: "123 Pickup Lane",
          pickupCity: "Greenville",
          pickupState: "CA",
          pickupZip: "94000",
        },
      })
    )
  }

  // Pending intakes
  for (let i = 0; i < 3; i++) {
    const daysAhead = Math.floor(Math.random() * 7) + 3
    const clientIndex = Math.floor(Math.random() * clients.length)
    const client = clients[clientIndex]
    const estimatedWeight = Math.round((Math.random() * 6 + 1) * 100) / 100
    const scheduledDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    intakes.push(
      prisma.wasteIntake.create({
        data: {
          ticketNumber: `WI-${scheduledDate.getFullYear().toString().slice(-2)}${(scheduledDate.getMonth() + 1).toString().padStart(2, "0")}${scheduledDate.getDate().toString().padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          clientId: client.id,
          wasteType: "food_waste",
          estimatedWeight,
          packagingType: "totes",
          deliveryType: "ssw_pickup",
          scheduledDate,
          scheduledTimeWindow: "10AM-12PM",
          status: "pending",
          contaminationCertified: true,
          tippingFeeRate: client.tippingFeeRate,
        },
      })
    )
  }

  const createdIntakes = await Promise.all(intakes)
  console.log(`Created ${createdIntakes.length} intakes`)

  // Create waste type configurations
  const wasteTypesConfig = await Promise.all([
    prisma.wasteTypeConfig.create({
      data: {
        code: "food_waste",
        name: "Food Waste",
        description: "General food waste and scraps",
        category: "organic",
        acceptedStatus: "accepted",
        defaultRate: 45.00,
      },
    }),
    prisma.wasteTypeConfig.create({
      data: {
        code: "green_waste",
        name: "Green Waste / Yard Trimmings",
        description: "Grass clippings, leaves, branches",
        category: "green_waste",
        acceptedStatus: "accepted",
        defaultRate: 35.00,
      },
    }),
    prisma.wasteTypeConfig.create({
      data: {
        code: "wood_chips",
        name: "Wood Chips",
        description: "Chipped wood and tree debris",
        category: "wood",
        acceptedStatus: "accepted",
        defaultRate: 30.00,
      },
    }),
    prisma.wasteTypeConfig.create({
      data: {
        code: "brewery_grain",
        name: "Brewery Grain",
        description: "Spent grain from brewing operations",
        category: "organic",
        acceptedStatus: "accepted",
        defaultRate: 40.00,
      },
    }),
    prisma.wasteTypeConfig.create({
      data: {
        code: "manure",
        name: "Manure",
        description: "Animal manure for composting",
        category: "manure",
        acceptedStatus: "accepted",
        defaultRate: 25.00,
      },
    }),
  ])

  console.log(`Created ${wasteTypesConfig.length} waste type configurations`)

  // Create a sample user
  await prisma.user.create({
    data: {
      email: "operations@soilseedwater.com",
      name: "Operations Team",
      role: "admin",
    },
  })

  await prisma.alertRecipient.upsert({
    where: { phone_site: { phone: "+19285501649", site: "congress_az" } },
    update: {
      name: "Rodolfo Alvarez",
      email: "ralvarez@soilseedandwater.com",
      active: true,
    },
    create: {
      name: "Rodolfo Alvarez",
      phone: "+19285501649",
      email: "ralvarez@soilseedandwater.com",
      site: "congress_az",
      active: true,
    },
  })

  console.log("Created sample user")
  console.log("Ensured alert recipient for Congress AZ")
  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
