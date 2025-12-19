const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function saveWeighTickets() {
  try {
    // Ticket 1
    const ticket1 = await prisma.scaleTransaction.create({
      data: {
        ticketNumber: '121925-01',
        transactionType: 'outbound_pickup',
        status: 'completed',
        haulerCompany: 'eco',
        licensePlate: '4UH4601',
        vehicleType: 'Semi Trailer',
        driverName: '',
        materialType: 'Waste',
        grossWeight: 74660,
        tareWeight: 36120,
        netWeight: 38540,
        timeIn: new Date('2025-12-19T09:00:00'),
        timeOut: new Date('2025-12-19T10:00:00'),
        operatorNotes: 'Trailer #141359. Origin: 18980 Stanton Rd, Congress, AZ 85332. Destination: Robinson Calf Ranch, 1001 East Hosking Avenue, Bakersfield CA 93307. BOL for Friday, Dec 19, 2025 - Truck 1 of 2. Scale Operator: SC',
      },
    });

    console.log('✓ Ticket 1 saved:', ticket1.ticketNumber);

    // Ticket 2
    const ticket2 = await prisma.scaleTransaction.create({
      data: {
        ticketNumber: '121925-02',
        transactionType: 'outbound_pickup',
        status: 'completed',
        haulerCompany: 'eco',
        licensePlate: '4NC8490',
        vehicleType: 'Semi Trailer',
        driverName: '',
        materialType: 'Waste',
        grossWeight: 71340,
        tareWeight: 36120,
        netWeight: 35220,
        timeIn: new Date('2025-12-19T10:00:00'),
        timeOut: new Date('2025-12-19T10:50:00'),
        operatorNotes: 'Origin: 18980 Stanton Rd, Congress, AZ 85332. Destination: Robinson Calf Ranch, 1001 East Hosking Avenue, Bakersfield CA 93307. BOL for Friday, Dec 19, 2025 - Truck 2 of 2. Scale Operator: SC',
      },
    });

    console.log('✓ Ticket 2 saved:', ticket2.ticketNumber);
    console.log('\n✓ Both weigh tickets saved successfully!');
  } catch (error) {
    console.error('Error saving weigh tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

saveWeighTickets();
