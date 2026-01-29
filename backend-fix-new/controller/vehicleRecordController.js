import VehicleRecord from "../model/vehicleRecords.js";

export async function createVehicleRecord(req, res) {
    try {

        const vehicleRecord = new VehicleRecord({
            passId: req.body.passId,
            data: req.body.data,
            time: req.body.time,
            vehcleNumber: req.body.vehcleNumber,
            vehicleType: req.body.vehicleType,
            driverName: req.body.driverName,
            purpose: req.body.purpose,
            to: req.body.to,
            bringItems: req.body.bringItems,
            outTime: req.body.outTime,
            inTime: req.body.inTime,
            approvalStatus: req.body.approvalStatus
        }
        );
        await vehicleRecord.save();
        res.status(201).json({
            message: "Vehicle record created successfully",

        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Failed to create vehicle record"
        })
    }
}

export async function viewAllVehicleRecords(req, res) {
    try {
        const records = await VehicleRecord.find();
        if (!records || records.length === 0) {
            res.status(404).json({
                message: "No vehicle records found"
            })
            return
        }
        res.status(200).json(records);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Failed to fetch vehicle records"
        })
    }
}

export async function viewVehicleRecordById(req, res) {
    try {
        const passId = req.params.passId;
        const pass = await VehicleRecord.findOne({ passId: passId });
        if (pass == null) {
            res.status(404).json({
                message: "No vehicle record found"
            })
            return
        }
        res.status(200).json(pass);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Failed to fetch vehicle record"
        })
    }
}