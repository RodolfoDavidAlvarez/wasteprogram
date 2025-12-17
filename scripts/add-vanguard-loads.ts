import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding Vanguard Renewables loads to calendar...')

  // Check if Vanguard client exists, if not create it
  let vanguardClient = await prisma.client.findUnique({
    where: { accountNumber: 'VR-001' },
  })

  if (!vanguardClient) {
    console.log('Creating Vanguard Renewables client...')
    vanguardClient = await prisma.client.create({
      data: {
        companyName: 'Vanguard Renewables',
        accountNumber: 'VR-001',
        operationalContact: 'Casey Tucker',
        operationalEmail: 'ctucker@vanguardrenewables.com',
        operationalPhone: '774-766-8863',
        billingContact: 'Kyle Fortune',
        billingEmail: 'kfortune@vanguardrenewables.com',
        billingPhone: '508-292-9387',
        address: '133 Boston Post Road',
        city: 'Weston',
        state: 'MA',
        zipCode: '02493',
        contractReference: 'MSPA-2025-10-09',
        tippingFeeRate: 45.00,
        notes: 'Off-spec dog/cat food - Salmonella contaminated, slip sheets',
        status: 'active',
      },
    })
    console.log(`Created client: ${vanguardClient.companyName} (${vanguardClient.accountNumber})`)
  } else {
    console.log(`Found existing client: ${vanguardClient.companyName} (${vanguardClient.accountNumber})`)
  }

  // VR loads with their scheduled dates
  const vrLoads = [
    // Original 9 loads
    { vrNumber: 'VR121125-109', date: '2025-12-11', timeWindow: '12:00 PM - 2:00 PM' },
    { vrNumber: 'VR121125-110', date: '2025-12-11', timeWindow: '12:00 PM - 2:00 PM' },
    { vrNumber: 'VR121225-98', date: '2025-12-12', timeWindow: '11:00 AM - 2:00 PM' },
    { vrNumber: 'VR121225-99', date: '2025-12-12', timeWindow: '11:00 AM - 2:00 PM' },
    { vrNumber: 'VR121525-49', date: '2025-12-15', timeWindow: '11:00 AM - 2:00 PM' },
    { vrNumber: 'VR121525-50', date: '2025-12-16', timeWindow: '11:00 AM - 2:00 PM' }, // Rescheduled from 12/15
    { vrNumber: 'VR121025-117', date: '2025-12-16', timeWindow: '11:00 AM - 2:00 PM' },
    { vrNumber: 'VR121625-45', date: '2025-12-16', timeWindow: '2:20 PM' },
    { vrNumber: 'VR121725-41', date: '2025-12-17', timeWindow: '11:00 AM - 2:00 PM' },
    // Additional 2 loads
    { vrNumber: 'VR121725-72', date: '2025-12-17', timeWindow: '3:00 PM' },
    { vrNumber: 'VR121825-74', date: '2025-12-18', timeWindow: '11:00 AM - 2:00 PM' },
  ]

  console.log(`\nAdding ${vrLoads.length} VR loads to the calendar...`)

  for (const load of vrLoads) {
    // Check if this VR number already exists
    const existing = await prisma.wasteIntake.findUnique({
      where: { ticketNumber: load.vrNumber },
    })

    if (existing) {
      console.log(`  ⏭️  ${load.vrNumber} already exists - skipping`)
      continue
    }

    // Create the waste intake
    const intake = await prisma.wasteIntake.create({
      data: {
        ticketNumber: load.vrNumber,
        clientId: vanguardClient.id,
        wasteType: 'food_waste',
        wasteDescription: 'Off-spec dog/cat food in packaging on slip sheets - Salmonella contaminated',
        estimatedWeight: 19.6, // 176.49 tons / 9 loads ≈ 19.6 tons per load
        packagingType: 'bags',
        deliveryType: 'client_delivery',
        scheduledDate: new Date(load.date + 'T14:00:00-07:00'), // 2 PM Arizona time
        scheduledTimeWindow: load.timeWindow,
        vehicleType: 'semi_trailer',
        driverContact: 'Casey Tucker (774-766-8863)',
        destinationSite: 'Congress, AZ',
        specialInstructions: 'Slip sheets - requires pallet jack or forklift. Ensure pallet orientation allows pallet jack access.',
        status: 'scheduled',
        approvedBy: 'Kyle Fortune',
        approvedAt: new Date('2025-12-09T15:00:00-07:00'),
        contaminationCertified: true,
        contaminationNotes: 'Salmonella contaminated - composting approved',
        tippingFeeRate: 45.00,
        totalCharge: 882.00, // 19.6 tons * $45/ton
      },
    })

    console.log(`  ✅ Added ${intake.ticketNumber} for ${load.date}`)
  }

  console.log('\n✨ All VR loads added successfully!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
