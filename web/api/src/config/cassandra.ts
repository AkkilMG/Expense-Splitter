import cassandra from 'cassandra-driver';
import "dotenv/config";

const client = new cassandra.Client({
  contactPoints: [process.env.CONTACT_POINT], // ['127.0.0.1'], // Update this with your Cassandra contact points
  localDataCenter: process.env.DC, // 'datacenter1',
  keyspace: process.env.KEYSPACE // 'your_keyspace' // Replace with your keyspace
});

client.connect(err => {
  if (err) console.error('Failed to connect to Cassandra', err);
  else console.log('Connected to Cassandra');
});

export default client;
