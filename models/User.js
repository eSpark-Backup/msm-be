const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        label: {
            type: String
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
            type: String
        },
        description: {
            type: String
        },
        method: {
            type: String
        },
        owner: {
            type: String
        },
        groups: [
            {
                type: String
            }
        ],
        customer_name: {
            type: String
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
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
        const salt = await bcrypt.genSalt(10);
        update.password = await bcrypt.hash(update.password, salt);
        this.setUpdate(update);
    }

    next();
});

UserSchema.virtual("role", {
    ref: "Role",
    localField: "role_id",
    foreignField: "_id",
    justOne: true
})

module.exports = mongoose.model("User", UserSchema);
