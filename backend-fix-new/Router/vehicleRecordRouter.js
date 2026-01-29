
import e from "express";
import { createVehicleRecord, viewAllVehicleRecords,viewVehicleRecordById } from "../controller/vehicleRecordController.js";

const vehicleRecordRouter = e.Router();

vehicleRecordRouter.post('/',createVehicleRecord);
vehicleRecordRouter.get('/',viewAllVehicleRecords);
vehicleRecordRouter.get('/:passId',viewVehicleRecordById);


export default vehicleRecordRouter;