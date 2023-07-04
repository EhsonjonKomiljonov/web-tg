import { readFile } from '../utils/fs.js';
import jwt from 'jsonwebtoken';

export const loginController = {
  POST: (req, res) => {
    try {
      const SECRET_KEY = process.env.SECRET_KEY;
      const users = JSON.parse(readFile('/data/users.json')) || [];

      const { email, password } = req.body;

      const finder = users.find(
        (item) => item.email == email && item.password == password
      );

      if (!finder)
        return res.send({
          status: 400,
          message: 'Incorrect email or password',
        });

      const token = jwt.sign(
        { id: finder.id, user_name: finder.user_name },
        SECRET_KEY
      );

      return res.send({
        status: 200,
        message: 'success',
        token,
      });
    } catch (err) {
      return res.send({
        status: 404,
        message: err.message,
      });
    }
  },
};
