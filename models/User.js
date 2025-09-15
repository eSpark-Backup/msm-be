const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        username:{
            type:String,
            default: null
        },
        label: {
            type: String,
            default: null
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        phone_number: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        method: {
            type: String,
            default: null
        },
        owner: {
            type: String,
            default: null
        },
        customer_name: {
            type: String,
            default: null
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        logo: {
            type:String,
            default: null
        },
        profile_image: {
            type:String,
            default:null
        },
        company_mail: {
            type:String,
            default: null
        },
        date_of_birth: {
            type:String,
            default: null
        },
        company_name:{
            type:String,
            default: null
        },
        status: {
            type:String,
            default:'active'
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();

    if (update.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(update.password, salt);
            this.setUpdate({ ...update, password: hashedPassword });
        } catch (err) {
            return next(err);
        }
    }

    next();
});

UserSchema.virtual("role", {
    ref: "Role",
    localField: "role_id",
    foreignField: "_id",
    justOne: true
})

UserSchema.virtual("groupsData", {
    ref: "Group",
    localField: "_id",
    foreignField: "user_id",
    justOne: false
})


module.exports = mongoose.model("User", UserSchema);
