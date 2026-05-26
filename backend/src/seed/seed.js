import mongoose from 'mongoose';
import slugify from 'slugify';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { Property } from '../models/Property.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Wishlist } from '../models/Wishlist.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { createInvoiceNumber } from '../utils/invoice.js';

const cities = [
  ['New York', 'NY'],
  ['Austin', 'TX'],
  ['Miami', 'FL'],
  ['Seattle', 'WA'],
  ['Denver', 'CO'],
  ['San Diego', 'CA'],
  ['Boston', 'MA'],
  ['Chicago', 'IL']
];
const categories = ['apartment', 'villa', 'house', 'condo', 'studio', 'commercial', 'land'];
const amenities = ['Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Elevator', 'Smart Home', 'Pet Friendly', 'Clubhouse'];
const listingTypes = ['rent', 'sale'];
const names = ['Avery', 'Jordan', 'Riley', 'Morgan', 'Taylor', 'Cameron', 'Parker', 'Quinn', 'Reese', 'Skyler'];

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const range = (count) => Array.from({ length: count }, (_, index) => index);
const money = (min, max) => Math.round(min + Math.random() * (max - min));

const reset = async () => {
  await Promise.all([
    User.deleteMany({}),
    AgentProfile.deleteMany({}),
    Property.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Wishlist.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    Chat.deleteMany({}),
    Message.deleteMany({}),
    Report.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
};

const seed = async () => {
  await connectDB();
  await reset();

  const admin = await User.create({
    name: 'Admin Luxe',
    email: 'admin@rems.local',
    password: 'AdminPass123!',
    role: 'admin',
    isEmailVerified: true
  });

  const agents = await Promise.all(
    range(5).map((i) =>
      User.create({
        name: `${pick(names)} Agent ${i + 1}`,
        email: `agent${i + 1}@rems.local`,
        password: 'AgentPass123!',
        phone: `+1555000${100 + i}`,
        role: 'agent',
        isEmailVerified: true
      })
    )
  );

  await Promise.all(
    agents.map((agent, i) =>
      AgentProfile.create({
        user: agent._id,
        agencyName: `LuxeEstate Partner ${i + 1}`,
        licenseNumber: `LIC-REMS-${1000 + i}`,
        bio: 'Verified real estate specialist focused on smooth, transparent transactions.',
        yearsExperience: 3 + i,
        serviceAreas: cities.slice(0, 4).map(([city]) => city),
        specializations: ['rentals', 'sales', i % 2 ? 'luxury' : 'residential'],
        verificationStatus: 'approved',
        rating: 4.2 + Math.random() * 0.7,
        totalReviews: 10 + i
      })
    )
  );

  const customers = await Promise.all(
    range(25).map((i) =>
      User.create({
        name: `${pick(names)} Customer ${i + 1}`,
        email: `customer${i + 1}@rems.local`,
        password: 'CustomerPass123!',
        phone: `+1555111${100 + i}`,
        role: 'customer',
        isEmailVerified: true
      })
    )
  );

  await Promise.all(customers.map((customer) => Wishlist.create({ user: customer._id, properties: [] })));

  const properties = [];
  for (const i of range(100)) {
    const [city, state] = pick(cities);
    const listingType = pick(listingTypes);
    const category = pick(categories);
    const title = `${city} ${category} ${listingType === 'rent' ? 'Rental' : 'Residence'} ${i + 1}`;
    properties.push(
      await Property.create({
        title,
        slug: `${slugify(title, { lower: true, strict: true })}-${i + 1}`,
        description: 'A polished, move-in ready property with practical amenities, strong location value, and professional management.',
        price: listingType === 'rent' ? money(1500, 9000) : money(250000, 2500000),
        listingType,
        category,
        bedrooms: category === 'studio' ? 0 : money(1, 6),
        bathrooms: money(1, 5),
        squareFeet: money(550, 5200),
        address: `${100 + i} Meridian Avenue`,
        city,
        state,
        zipCode: `${10000 + i}`,
        coordinates: { type: 'Point', coordinates: [-74 + Math.random() * 40, 25 + Math.random() * 20] },
        amenities: amenities.sort(() => 0.5 - Math.random()).slice(0, 5),
        nearbyPlaces: [
          { name: 'Metro Station', distance: '0.8 mi', category: 'Transit' },
          { name: 'Central Market', distance: '1.1 mi', category: 'Shopping' }
        ],
        images: [
          { url: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80&seed=${i}`, caption: 'Exterior' },
          { url: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80&seed=${i}`, caption: 'Living area' }
        ],
        featured: i < 12,
        verified: true,
        status: 'active',
        agent: pick(agents)._id,
        rating: 3.8 + Math.random() * 1.1,
        reviews: money(1, 30)
      })
    );
  }

  const bookings = [];
  for (const i of range(35)) {
    const property = pick(properties);
    const customer = pick(customers);
    const status = pick(['pending', 'payment_pending', 'confirmed', 'rejected']);
    bookings.push(
      await Booking.create({
        customer: customer._id,
        agent: property.agent,
        property: property._id,
        type: pick(['visit', 'rent_request', 'buy_request']),
        visitDate: new Date(Date.now() + money(1, 21) * 24 * 60 * 60 * 1000),
        message: 'I would like to know more and schedule next steps.',
        status,
        approvedAt: ['payment_pending', 'confirmed'].includes(status) ? new Date() : undefined,
        paidAt: status === 'confirmed' ? new Date() : undefined,
        confirmedAt: status === 'confirmed' ? new Date() : undefined,
        rejectionReason: status === 'rejected' ? 'Schedule unavailable' : undefined
      })
    );
  }

  const paidBookings = bookings.filter((booking) => booking.status === 'confirmed');
  await Promise.all(
    paidBookings.map((booking) =>
      Payment.create({
        booking: booking._id,
        customer: booking.customer,
        agent: booking.agent,
        property: booking.property,
        amount: money(500, 5000),
        method: pick(['card', 'upi', 'wallet']),
        status: 'paid',
        transactionId: `TXN-SEED-${booking._id.toString()}`,
        invoiceNumber: createInvoiceNumber(),
        invoice: { customerName: 'Seed Customer', propertyTitle: 'Seed Property', issuedAt: new Date(), lineItems: [{ label: 'Booking holding fee', amount: 1000 }] }
      })
    )
  );

  await Promise.all(
    range(80).map(async () => {
      const property = pick(properties);
      const customer = pick(customers);
      return Review.create({
        user: customer._id,
        property: property._id,
        agent: property.agent,
        rating: money(3, 5),
        comment: 'Clear details, responsive agent, and a property that matched expectations.'
      }).catch(() => null);
    })
  );

  await Promise.all(
    customers.slice(0, 10).map((customer, i) =>
      Notification.create({
        user: customer._id,
        title: 'Welcome to LuxeEstate',
        message: 'Your dashboard is ready with saved searches, bookings, and alerts.',
        type: 'system',
        read: i % 2 === 0
      })
    )
  );

  await Report.create({
    reporter: customers[0]._id,
    targetType: 'property',
    target: properties[0]._id,
    reason: 'Listing information needs review',
    details: 'The user asked the platform team to verify the price and availability.',
    status: 'open'
  });

  console.log('Seed complete');
  console.log('Admin: admin@rems.local / AdminPass123!');
  console.log('Agent: agent1@rems.local / AgentPass123!');
  console.log('Customer: customer1@rems.local / CustomerPass123!');
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
