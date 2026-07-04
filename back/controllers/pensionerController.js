// controllers/pensionerController.js

const Pensioner = require("../models/Pensioner");
const path = require("path");

/**
 * Register Pensioner
 * POST /api/pensioners/register
 */
const registerPensioner = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Registration image is required."
            });
        }

        const {
            pensionerId,
            nameAmh,
            nameEng,
            tin,
            phone,
            age,
            gender,
            faydaNumber,
            poessaBranch,
            bankNameAmh,
            bankNameEng,
            bankBranch,
            pensionAmount,
            addressAmh,
            addressEng,
            issueDate,
            expiryDate,
faceDescriptor
            
        } = req.body;

        const existingPensioner = await Pensioner.findOne({
            $or: [
                { pensionerId },
                { faydaNumber }
            ]
        });

        if (existingPensioner) {
            return res.status(400).json({
                success: false,
                message: "Pensioner already exists."
            });
        }

        const imagePath = `/uploads/registration/${req.file.filename}`;

        const pensioner = await Pensioner.create({

            pensionerId,
            nameAmh,
            nameEng,
            tin,
            phone,
            age,
            gender,
            faydaNumber,
            poessaBranch,
            bankNameAmh,
            bankNameEng,
            bankBranch,
            pensionAmount,
            addressAmh,
            addressEng,
            issueDate,
            expiryDate,

            image: imagePath,

            verified: false,
            faceMatched: false,
            livenessPassed: false,
            verificationAttempts: 0,

            faceDescriptor: faceDescriptor
    ? JSON.parse(faceDescriptor)
    : [],

        });

        res.status(201).json({
            success: true,
            message: "Pensioner registered successfully.",
            data: pensioner
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * Get All Pensioners
 * GET /api/pensioners
 */
const getAllPensioners = async (req, res) => {

    try {

        const pensioners = await Pensioner.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: pensioners.length,
            data: pensioners
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * Get Pensioner By ID
 * GET /api/pensioners/:id
 */
const getPensionerById = async (req, res) => {

    try {

        const pensioner = await Pensioner.findById(req.params.id);

        if (!pensioner) {

            return res.status(404).json({
                success: false,
                message: "Pensioner not found."
            });

        }

        res.status(200).json({
            success: true,
            data: pensioner
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * Search Pensioner
 * GET /api/pensioners/search/:keyword
 */
const searchPensioner = async (req, res) => {

    try {

        const keyword = req.params.keyword;

        const pensioners = await Pensioner.find({

            $or: [

                {
                    pensionerId: {
                        $regex: keyword,
                        $options: "i"
                    }
                },

                {
                    faydaNumber: {
                        $regex: keyword,
                        $options: "i"
                    }
                },

                {
                    nameEng: {
                        $regex: keyword,
                        $options: "i"
                    }
                },

                {
                    nameAmh: {
                        $regex: keyword,
                        $options: "i"
                    }
                }

            ]

        });

        res.status(200).json({
            success: true,
            count: pensioners.length,
            data: pensioners
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * Update Pensioner
 * PUT /api/pensioners/:id
 */
const updatePensioner = async (req, res) => {

    try {

        const pensioner = await Pensioner.findById(req.params.id);

        if (!pensioner) {

            return res.status(404).json({
                success: false,
                message: "Pensioner not found."
            });

        }

        if (req.file) {
            req.body.image = `/uploads/registration/${req.file.filename}`;
        }

        const updated = await Pensioner.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        res.status(200).json({

            success: true,
            message: "Pensioner updated successfully.",

            data: updated

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/**
 * Delete Pensioner
 * DELETE /api/pensioners/:id
 */
const deletePensioner = async (req, res) => {

    try {

        const pensioner = await Pensioner.findById(req.params.id);

        if (!pensioner) {

            return res.status(404).json({
                success: false,
                message: "Pensioner not found."
            });

        }

        await pensioner.deleteOne();

        res.status(200).json({

            success: true,

            message: "Pensioner deleted successfully."

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    registerPensioner,

    getAllPensioners,

    getPensionerById,

    searchPensioner,

    updatePensioner,

    deletePensioner

};
