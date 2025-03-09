import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI muss in der Umgebungsvariable definiert sein');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In der Entwicklung verwenden wir eine globale Variable, damit Verbindungen während Hot Reloads erhalten bleiben
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In der Produktion möchten wir eine neue Verbindung für jeden Request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getConsumptionCollection() {
  const client = await clientPromise;
  return client.db('car_electricity_db').collection('consumption');
}