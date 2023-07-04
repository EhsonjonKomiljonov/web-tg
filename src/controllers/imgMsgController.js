import { readFile, writeFile } from '../utils/fs.js';
import jwt from 'jsonwebtoken';

export const imgMsgController = {
  GET: (req, res) => {
    try {
      const messages = JSON.parse(readFile('/data/messages.json'));

      return res.send({
        status: 200,
        message: 'success',
        data: messages,
      });
    } catch (err) {
      return res.send({
        status: err.message == 'jwt must be provided' ? 401 : 404,
        message:
          err.message == 'jwt must be provided' ? 'Unauthorized' : err.message,
        data: [],
      });
    }
  },
  POST: (req, res) => {
    try {
      const messages = JSON.parse(readFile('/data/messages.json'));
      const { img_msg } = req.files;
      const { user, user_img, time } = req.body;

      if (!img_msg) throw new Error('Incorrect value');

      if (
        img_msg.mimetype != 'image/jpeg' &&
        img_msg.mimetype != 'image/png' &&
        img_msg.mimetype != 'image/svg' &&
        img_msg.mimetype != 'image/webp'
      )
        return res.send({
          status: 404,
          message: 'Incorrect image type!',
        });

      if (img_msg.truncated)
        return res.send({
          status: 404,
          message: 'Image size incorrect!',
        });

      img_msg.mv(process.cwd() + '/public/' + img_msg.md5 + img_msg.name);

      messages.push({
        id: messages.at(-1)?.id + 1 || 1,
        user,
        img_msg: '/' + img_msg.md5 + img_msg.name,
        time,
        user_img,
      });

      writeFile('/data/messages.json', messages);

      return res.send({
        status: 200,
        message: 'success',
        data: messages,
      });
    } catch (err) {
      return res.send({
        status: 404,
        message: err.message,
        data: [],
      });
    }
  },
};
