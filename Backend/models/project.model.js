import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: [true, 'Project name must be unique'],
    },

    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Description must not exceed 500 characters'],
        default: ''
    },

    users: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member', 'viewer'],
                default: 'member',
                lowercase: true
            }
        }
    ]
}, {
    timestamps: true
});



const Project = mongoose.model('project', projectSchema);
export default Project;