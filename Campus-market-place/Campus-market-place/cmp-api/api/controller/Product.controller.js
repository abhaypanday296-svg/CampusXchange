import { Product } from "../models/product.js";
import jwt from "jsonwebtoken";

// CREATE PRODUCT
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, quantity, category } = req.body;

    if (!title || !description || !price || !quantity || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const images =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

    const parsedQuantity = Number(quantity);

    const product = await Product.create({
      title,
      description,
      price,
      quantity: parsedQuantity,
      category,
      inStock: parsedQuantity > 0,
      images,
      seller: user.id,
      college: user.college,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// GET ALL PRODUCTS
export const getAllProducts = async (req, res, next) => {
  try {
    let filters = {
      inStock: true,
      quantity: { $gt: 0 },
    };

    const token = req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Exclude user's own products
      filters.seller = { $ne: decoded.id };

      // Show only same college products
      if (decoded.college) {
        filters.college = decoded.college;
      }
    }

    const products = await Product.find(filters)
      .populate("college", "collegeName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: products || [],
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// GET MY LISTINGS
export const getMyListing = async (req, res, next) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    })
      .populate("college", "collegeName")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      data: products,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// MARK PRODUCT AS SOLD
export const markAsSold = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndUpdate(
      {
        _id: id,
        seller: req.user.id,
      },
      {
        inStock: false,
        quantity: 0,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Product marked as sold successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      price,
      quantity,
      category,
    } = req.body;

    const parsedQuantity = Number(quantity);

    let updateData = {
      title,
      description,
      price,
      quantity: parsedQuantity,
      category,
      inStock: parsedQuantity > 0,
    };

    // Update images if new files uploaded
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      updateData.images = images;
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: id,
        seller: req.user.id,
      },
      updateData,
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndDelete({
      _id: id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};