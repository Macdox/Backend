import mongoose from 'mongoose';

const ClassesSchema = new mongoose.Schema({
  // Define your schema fields here
  name: {
    type: String,
    required: true,
  },
  // ...other fields...
});

const Classes = mongoose.model('Classes', ClassesSchema);

export default Classes;
