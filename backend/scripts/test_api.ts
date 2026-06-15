import axios from 'axios';
import { Database } from '../src/config/database';
import { User } from '../src/models/User';
import jwt from 'jsonwebtoken';
import { Config } from '../src/config/environment';

async function run() {
  try {
    await Database.authenticate();
    const admin = await User.findOne({ where: { email: 'sarkarabhisek50@gmail.com' } });
    const token = jwt.sign(
      { id: admin!.id, roleId: admin!.roleId, role: 'super_admin' },
      Config.jwt.secret as jwt.Secret,
      { expiresIn: '1h' }
    );

    const res = await axios.get('http://localhost:5001/api/v1/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("RESPONSE SUCCESS:", JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log("RESPONSE ERROR:", err.response?.status, JSON.stringify(err.response?.data, null, 2));
  }
  process.exit(0);
}

run();
