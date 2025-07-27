import {Product} from "@/models/Product";
import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  try {
    await isAdminRequest(req, res);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (method === 'GET') {
    try {
      if (req.query?.id) {
        const product = await Product.findOne({ _id: req.query.id });
        return res.json(product);
      } else {
        const products = await Product.find();
        return res.json(products);
      }
    } catch (error) {
      console.error('GET /api/products error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  if (method === 'POST') {
    try {
      const { title, description, price, images, category, properties } = req.body;

      // Validate price is a number
      const priceNum = Number(price);
      if (isNaN(priceNum)) {
        return res.status(400).json({ error: 'Price must be a number' });
      }

      const productDoc = await Product.create({
        title,
        description,
        price: priceNum,
        images,
        category,
        properties,
      });
      return res.json(productDoc);
    } catch (error) {
      console.error('POST /api/products error:', error);
      return res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { title, description, price, images, category, properties, _id } = req.body;

      const priceNum = Number(price);
      if (isNaN(priceNum)) {
        return res.status(400).json({ error: 'Price must be a number' });
      }

      await Product.updateOne({ _id }, {
        title,
        description,
        price: priceNum,
        images,
        category,
        properties,
      });
      return res.json(true);
    } catch (error) {
      console.error('PUT /api/products error:', error);
      return res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
  }

  if (method === 'DELETE') {
    try {
      if (req.query?.id) {
        await Product.deleteOne({ _id: req.query.id });
        return res.json(true);
      }
      return res.status(400).json({ error: 'Missing id' });
    } catch (error) {
      console.error('DELETE /api/products error:', error);
      return res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}


// import {Product} from "@/models/Product";
// import {mongooseConnect} from "@/lib/mongoose";
// import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

// export default async function handle(req, res) {
//   const {method} = req;
//   await mongooseConnect();
//   await isAdminRequest(req,res);

//   if (method === 'GET') {
//     if (req.query?.id) {
//       res.json(await Product.findOne({_id:req.query.id}));
//     } else {
//       res.json(await Product.find());
//     }
//   }

//   if (method === 'POST') {
//     const {title,description,price,images,category,properties} = req.body;
//     const productDoc = await Product.create({
//       title,description,price,images,category,properties,
//     })
//     res.json(productDoc);
//   }

//   if (method === 'PUT') {
//     const {title,description,price,images,category,properties,_id} = req.body;
//     await Product.updateOne({_id}, {title,description,price,images,category,properties});
//     res.json(true);
//   }

//   if (method === 'DELETE') {
//     if (req.query?.id) {
//       await Product.deleteOne({_id:req.query?.id});
//       res.json(true);
//     }
//   }
// }