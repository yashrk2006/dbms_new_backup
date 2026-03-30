import net from 'net';

const regions = [
  'us-east-1', 'us-west-2', 'ap-south-1', 'ap-southeast-1', 'ap-northeast-1',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'sa-east-1', 'ap-southeast-2'
];

async function check(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: 6543, timeout: 2000 }, () => {
      resolve({ region, host, status: 'reachable' });
      socket.destroy();
    });
    socket.on('error', (err) => resolve({ region, host, status: 'error', msg: err.message }));
    socket.on('timeout', () => resolve({ region, host, status: 'timeout' }));
  });
}

console.log('Checking regional poolers...');
const results = await Promise.all(regions.map(check));
console.table(results.filter(r => r.status === 'reachable'));
