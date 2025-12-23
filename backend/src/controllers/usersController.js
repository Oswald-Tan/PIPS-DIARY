import User from "../models/user.js";
import Role from "../models/role.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import db from "../config/database.js";
import fs from "fs";

export const addAdmin = async (req, res) => {
  const {
    name,
    email,
    phone_number,
    password,
    role,
  } = req.body;

  // Ambil file jika ada
  const photo_profile = req.files?.photo_profile;

  // Validasi input
  if (!name || !email || !phone_number || !password || !role) {
    return res.status(400).json({
      message: "Field wajib harus diisi",
      success: false,
    });
  }

  // Validasi email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Format email tidak valid",
      success: false,
    });
  }

  // Validasi nomor HP
  const phoneRegex = /^(?:\+62|0)[0-9]{8,12}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({
      message: "Format nomor HP tidak valid. Gunakan format 08xxx atau +62xxx",
      success: false,
    });
  }

  try {
    // Cek duplikat data
    const existingName = await User.findOne({ where: { name } });
    if (existingName) {
      return res.status(409).json({
        message: "Name telah terdaftar",
        success: false,
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        message: "Email telah terdaftar",
        success: false,
      });
    }

    const existingPhone = await User.findOne({
      where: { phone_number },
    });
    if (existingPhone) {
      return res.status(409).json({
        message: "Nomor HP telah terdaftar",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cari role_id berdasarkan nama role
    const roleRecord = await Role.findOne({ where: { role_name: role } });
    if (!roleRecord) {
      return res.status(400).json({
        message: "Role tidak valid",
        success: false,
      });
    }

    // Buat user baru dengan transaction
    const t = await db.transaction();

    try {
      // 1. Buat user di tabel users
      const user = await User.create(
        {
          name,
          password: hashedPassword,
          role_id: roleRecord.id,
          email: email,
          phone_number: phone_number,
          status: "active",
        },
        { transaction: t }
      );

      // Handle file upload
      let photoPath = null;
      if (photo_profile) {
        const ext = path.extname(photo_profile.name);
        const filename = `${user.id}-${Date.now()}${ext}`;
        const savePath = path.join(
          __dirname,
          "../../public/images/profiles",
          filename
        );

        await photo_profile.mv(savePath);
        photoPath = `/images/profiles/${filename}`;
      }

      // Commit transaction
      await t.commit();

      return res.status(201).json({
        message: "Admin Prodi berhasil ditambahkan",
        success: true,
        userId: user.id,
      });
    } catch (error) {
      // Rollback transaction jika ada error
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error adding admin prodi:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      success: false,
      error: error.message,
    });
  }
};

export const listAdmin = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = limit * page;

  try {
    // Hitung total user berdasarkan pencarian name
    const totalUser = await User.count({
      include: {
        model: Role,
        as: "userRole",
        attributes: ["role_name"],
        where: { role_name: "admin" },
        required: true,
      },
      where: search ? { name: { [Op.substring]: search } } : {},
    });

    const totalRows = totalUser;
    const totalPage = Math.ceil(totalRows / limit);

    // Ambil data user dengan name dari DetailUsers
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
          where: { role_name: "admin" },
          required: true,
        },
      ],
      attributes: ["id", "name", "role_id", "email", "phone_number"],
      where: search ? { name: { [Op.substring]: search } } : {},
      order: [["name", "ASC"]],
      offset: offset,
      limit: limit,
    });

    // Mapping data untuk response
    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.userRole.role_name,
      email: user.email,
      phone_number: user.phone_number,
    }));

    res.status(200).json({
      data,
      page,
      limit,
      totalPage,
      totalRows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Edit Admin 
export const editAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Gunakan req.body untuk data text
    const {
      name,
      password,
      confirmPassword,
      role,
      status,
      email,
      phone_number,
    } = req.body;

    // Update user data
    if (name && name !== user.name) {
      user.name = name;
    }

    if (email) user.email = email;
    if (phone_number) user.phone_number = phone_number;

    if (password) {
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (role) {
      const roleObj = await Role.findOne({ where: { role_name: role } });
      if (!roleObj) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role_id = roleObj.id;
    }

    if (status) user.status = status;

    // Handle file upload
    if (req.file) {
      const fileName = req.file.filename;

      // Hapus file lama jika ada
      if (user.photo_profile) {
        const oldFilePath = path.join(
          __dirname,
          "../public/uploads",
          user.photo_profile
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      user.photo_profile = fileName;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Admin
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari admin berdasarkan ID
    const admin = await User.findByPk(id);
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin tidak ditemukan", success: false });
    }

    // Hapus admin
    await admin.destroy();

    return res
      .status(200)
      .json({ message: "Admin berhasil dihapus", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan", success: false });
  }
};

export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const role = req.query.role || "user";
  const offset = limit * page;

  try {
    // Cari role data
    const roleData = await Role.findOne({
      where: { role_name: role },
    });

    if (!roleData) {
      return res.status(404).json({ 
        message: `Role '${role}' tidak ditemukan`,
        success: false 
      });
    }

    // Build where clause
    const whereClause = { role_id: roleData.id };
    
    // Add search filter if provided
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.substring]: search } },
        { email: { [Op.substring]: search } },
        { phone_number: { [Op.substring]: search } }
      ];
    }

    // Hitung total user berdasarkan pencarian name
    const totalUser = await User.count({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: [],
          where: { id: roleData.id },
          required: true,
        },
      ],
      where: whereClause,
    });

    const totalRows = totalUser;
    const totalPage = Math.ceil(totalRows / limit);

    // Ambil data user dengan name dari DetailUsers
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
          where: { id: roleData.id },
          required: true,
        },
      ],
      attributes: [
        "id",
        "name",
        "email",
        "phone_number",
        "role_id",
      ],
      where: whereClause,
      order: [["name", "ASC"]],
      offset: offset,
      limit: limit,
    });

    // Mapping data untuk response
    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.userRole.role_name,
      email: user.email,
      phone_number: user.phone_number,
    }));

    res.status(200).json({
      data,
      page,
      limit,
      totalPage,
      totalRows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get total users
export const getTotalUsers = async (req, res) => {
  try {
    const totalUser = await User.count({
      where: { role_id: 2 },
    });
    res.status(200).json({ totalUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: [
        "id",
        "name",
        "email",
        "phone_number",
        "role_id",
      ],
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.userRole.role_name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, phone_number, password, confirmPassword, roleName } = req.body;

  try {
    // ========== VALIDASI INPUT ==========
    const errors = {};

    // 1. Validasi field wajib
    if (!name?.trim()) {
      errors.name = "Nama wajib diisi";
    }

    if (!email?.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email tidak valid";
    }

    if (!phone_number?.trim()) {
      errors.phone_number = "Nomor telepon wajib diisi";
    } else if (!/^(?:\+62|0)[0-9]{8,12}$/.test(phone_number)) {
      errors.phone_number = "Format nomor HP tidak valid. Gunakan format 08xxx atau +62xxx";
    }

    if (!password?.trim()) {
      errors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    if (!confirmPassword?.trim()) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    if (!roleName?.trim()) {
      errors.roleName = "Role wajib dipilih";
    }

    // Jika ada error validasi, kembalikan error
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validasi gagal",
        success: false,
        errors,
      });
    }

    // 2. Cek duplikasi email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        message: "Email sudah digunakan",
        success: false,
        field: "email"
      });
    }

    // 3. Cek duplikasi nomor telepon (jika diisi)
    if (phone_number) {
      const existingPhone = await User.findOne({ where: { phone_number } });
      if (existingPhone) {
        return res.status(409).json({ 
          message: "Nomor telepon sudah digunakan",
          success: false,
          field: "phone_number"
        });
      }
    }

    // 4. Cari role berdasarkan roleName
    const role = await Role.findOne({ where: { role_name: roleName } });
    if (!role) {
      return res.status(404).json({ 
        message: "Role tidak ditemukan",
        success: false,
        field: "roleName"
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Buat user baru
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim(),
      phone_number: phone_number.trim(),
      password: hashedPassword,
      role_id: role.id,
      status: "active", // Default status active
      currency: "USD", // Default currency
    });

    res.status(201).json({
      message: "User berhasil dibuat",
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role: role.role_name,
        status: newUser.status,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = {};
      error.errors.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      
      return res.status(400).json({
        message: "Validasi data gagal",
        success: false,
        errors: validationErrors,
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: "Terjadi kesalahan server",
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, password, confirmPassword, roleName } = req.body;

  try {
    // 1. Cari user berdasarkan ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        message: "User tidak ditemukan",
        success: false 
      });
    }

    // ========== VALIDASI INPUT ==========
    const errors = {};

    // Validasi field wajib
    if (name !== undefined && !name?.trim()) {
      errors.name = "Nama wajib diisi";
    }

    if (email !== undefined && !email?.trim()) {
      errors.email = "Email wajib diisi";
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email tidak valid";
    }

    if (phone_number !== undefined && !phone_number?.trim()) {
      errors.phone_number = "Nomor telepon wajib diisi";
    } else if (phone_number && !/^(?:\+62|0)[0-9]{8,12}$/.test(phone_number)) {
      errors.phone_number = "Format nomor HP tidak valid. Gunakan format 08xxx atau +62xxx";
    }

    if (password && !confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    } else if (password && password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    if (roleName !== undefined && !roleName?.trim()) {
      errors.roleName = "Role wajib dipilih";
    }

    // Jika ada error validasi, kembalikan error
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validasi gagal",
        success: false,
        errors,
      });
    }

    // 2. Cek duplikasi email (kecuali email user itu sendiri)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id } // Exclude current user
        } 
      });
      if (existingEmail) {
        return res.status(409).json({ 
          message: "Email sudah digunakan",
          success: false,
          field: "email"
        });
      }
    }

    // 3. Cek duplikasi nomor telepon (kecuali nomor user itu sendiri)
    if (phone_number && phone_number !== user.phone_number) {
      const existingPhone = await User.findOne({ 
        where: { 
          phone_number,
          id: { [Op.ne]: id } // Exclude current user
        } 
      });
      if (existingPhone) {
        return res.status(409).json({ 
          message: "Nomor telepon sudah digunakan",
          success: false,
          field: "phone_number"
        });
      }
    }

    // 4. Cari role jika roleName diubah
    let role = null;
    if (roleName) {
      role = await Role.findOne({ where: { role_name: roleName } });
      if (!role) {
        return res.status(404).json({ 
          message: "Role tidak ditemukan",
          success: false,
          field: "roleName"
        });
      }
    }

    // 5. Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone_number !== undefined) updateData.phone_number = phone_number.trim();
    if (role) updateData.role_id = role.id;
    
    // 6. Update password jika diisi
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 7. Update user
    await user.update(updateData);

    res.status(200).json({
      message: "User berhasil diupdate",
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: roleName || (user.role_id && (await Role.findByPk(user.role_id))?.role_name),
        status: user.status,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = {};
      error.errors.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      
      return res.status(400).json({
        message: "Validasi data gagal",
        success: false,
        errors: validationErrors,
      });
    }
    
    res.status(500).json({ 
      message: "Terjadi kesalahan server",
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const deletedUser = await User.destroy({
      where: { id: user.id },
    });

    res.status(200).json({ message: "User deleted", data: deletedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role, search, page = 0, limit = 10 } = req.query;
    const offset = (parseInt(page)) * parseInt(limit);

    if (!role) {
      return res.status(400).json({ 
        message: "Parameter 'role' wajib diisi",
        success: false 
      });
    }

    // Filter role yang diizinkan (tidak termasuk super_admin)
    const allowedRoles = ["user", "admin", "premium_user", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Role tidak valid. Hanya user, admin, premium_user, dan viewer yang diperbolehkan",
        success: false 
      });
    }

    const roleData = await Role.findOne({
      where: { role_name: role },
    });

    if (!roleData) {
      return res.status(404).json({ 
        message: `Role '${role}' tidak ditemukan`,
        success: false 
      });
    }

    // Build where clause
    const whereClause = { role_id: roleData.id };
    
    // Add search filter if provided
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ];
    }

    // Hitung total data
    const totalRows = await User.count({ where: whereClause });

    // Ambil data dengan pagination
    const users = await User.findAll({
      where: whereClause,
      attributes: ["id", "name", "email", "phone_number", "role_id"],
      offset: offset,
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    // Format data
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: role,
    }));

    // Return dengan status yang lebih jelas
    if (formattedUsers.length === 0) {
      return res.status(200).json({
        data: [],
        page: parseInt(page),
        limit: parseInt(limit),
        totalRows,
        totalPage: Math.ceil(totalRows / parseInt(limit)),
        message: search 
          ? `Tidak ditemukan user dengan role '${role}' untuk pencarian "${search}"`
          : `Tidak ada user dengan role '${role}'`,
        success: true,
        empty: true
      });
    }

    res.json({
      data: formattedUsers,
      page: parseInt(page),
      limit: parseInt(limit),
      totalRows,
      totalPage: Math.ceil(totalRows / parseInt(limit)),
      message: `Berhasil mendapatkan ${formattedUsers.length} user dengan role '${role}'`,
      success: true,
      empty: false
    });
  } catch (error) {
    console.error("Error in getUsersByRole:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server",
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// New: Get stats for all roles except super_admin
export const getUsersStats = async (req, res) => {
  try {
    const allowedRoles = ["user", "admin", "premium_user", "viewer"];
    
    // Get role data for all allowed roles
    const roleData = await Role.findAll({
      where: { role_name: allowedRoles },
    });

    if (!roleData || roleData.length === 0) {
      return res.status(404).json({ 
        message: "Role data tidak ditemukan",
        success: false 
      });
    }

    // Create map of role_id to role_name
    const roleMap = {};
    roleData.forEach(role => {
      roleMap[role.id] = role.role_name;
    });

    // Get role ids
    const roleIds = roleData.map(role => role.id);

    // Count users per role
    const userCounts = await User.findAll({
      attributes: [
        'role_id',
        [db.fn('COUNT', db.col('id')), 'count']
      ],
      where: {
        role_id: roleIds
      },
      group: ['role_id'],
      raw: true
    });

    // Format response
    const stats = {};
    let totalAll = 0;

    userCounts.forEach(item => {
      const roleName = roleMap[item.role_id];
      if (roleName) {
        stats[roleName] = parseInt(item.count);
        totalAll += parseInt(item.count);
      }
    });

    // Ensure all roles are included even if count is 0
    allowedRoles.forEach(role => {
      if (!stats[role]) {
        stats[role] = 0;
      }
    });

    // Add total
    stats.total = totalAll;

    res.status(200).json({
      success: true,
      data: stats,
      message: "Berhasil mendapatkan statistik user"
    });
  } catch (error) {
    console.error("Error in getUsersStats:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server",
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};