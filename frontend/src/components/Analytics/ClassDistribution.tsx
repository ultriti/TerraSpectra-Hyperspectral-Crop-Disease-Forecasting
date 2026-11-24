import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Healthy', value: 70 },
  { name: 'Stressed', value: 30 },
];

const COLORS = ['#22c55e', '#ef4444'];

export default function ClassDistribution() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '350px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>Crop Health Distribution</h3>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}