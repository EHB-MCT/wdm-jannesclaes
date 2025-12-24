const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
    password: { type: String, required: true, minlength: 8 },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    
    // BEHAVIORAL ANALYSIS FIELD - WEAPON OF MATH DESTRUCTION
    // Educational demonstration of algorithmic bias in user profiling
    // WARNING: This represents problematic surveillance and discriminatory practices
    analysis: {
        hesitationScore: { type: Number, default: 0 },           // Hover/click ratio - BIASED
        decisionEfficiency: { type: Number, default: 0 },       // Speed of decision making - FLAWED
        movementEfficiency: { type: Number, default: 0 },      // Mouse path efficiency - INACCURATE
        interactionComplexity: { type: Number, default: 0 },    // Diversity of interactions - MEANINGLESS
        cognitiveLoad: { type: Number, default: 0 },             // Supposed mental effort - ARBITRARY
        behavioralTags: [String],                                // Discriminatory labels
        lastAnalyzed: { type: Date },
        analysisVersion: { type: Number, default: 1 },          // Algorithm version tracking
        dataPoints: { type: Number, default: 0 }               // Number of telemetry events analyzed
    }
});



// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);