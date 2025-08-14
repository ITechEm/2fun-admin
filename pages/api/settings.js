// pages/api/settings.js (or wherever your API is)
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'GET') {
    const { name } = req.query;
    const setting = await db.collection('settings').findOne({ name });
    res.json(setting || {});
  } else if (req.method === 'PUT') {
    const { name, value } = req.body;
    if (!name) return res.status(400).json({ message: 'Missing setting name' });

    await db.collection('settings').updateOne(
      { name },
      { $set: { value } },
      { upsert: true }
    );
    res.json({ message: 'Setting updated' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}



// import {mongooseConnect} from "@/lib/mongoose";
// import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
// import {Setting} from "@/models/Setting";

// export default async function handle(req, res) {
//   await mongooseConnect();
//   await isAdminRequest(req, res);

//   if (req.method === 'PUT') {
//     const {name,value} = req.body;
//     const settingDoc = await Setting.findOne({name});
//     if (settingDoc) {
//       settingDoc.value = value;
//       await settingDoc.save();
//       res.json(settingDoc);
//     } else {
//       res.json(await Setting.create({name,value}));
//     }
//   }
//   if (req.method === 'GET') {
//   const { name } = req.query;

//   const defaultValues = {
//     shippingFee: '5.99',
//     featuredProductId: '',
//   };

//   let setting = await Setting.findOne({ name });

//   if (!setting && name in defaultValues) {
//     setting = await Setting.create({ name, value: defaultValues[name] });
//   }

//   res.json({ value: setting?.value || '' });
// }

//   // if (req.method === 'GET') {
//   //   const {name} = req.query;
//   //   res.json( await Setting.findOne({name}) );
//   // }
// }