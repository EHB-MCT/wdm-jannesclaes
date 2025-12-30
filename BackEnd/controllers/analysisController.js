const User = require('../models/User');
const Telemetry = require('../models/Telemetry');

/**
 * WEAPON OF MATH DESTRUCTION - BEHAVIORAL ANALYSIS CONTROLLER
 * 
 * Educational demonstration of algorithmic bias and problematic user profiling.
 * This code represents everything that's wrong with surveillance capitalism:
 * - Reducing complex human behavior to arbitrary numbers
 * - Creating discriminatory labels based on flawed metrics  
 * - Assuming patterns that don't actually exist
 * - Providing false sense of scientific legitimacy
 * 
 * WARNING: This is intentionally designed to show how harmful "data analysis" can be.
 * Never use this type of analysis in real applications.
 */

// BIASED PROFILING RULES - These represent problematic stereotypes
const BEHAVIORAL_PROFILES = {
    "Hesitant": {
        condition: (metrics) => metrics.hesitationScore > 5 && metrics.movementEfficiency < 0.6,
        description: "Excessive consideration before actions - assumes hovering equals indecisiveness",
        harmLevel: "Medium - Labels thoughtful users as problematic"
    },
    "Impulsive": {
        condition: (metrics) => metrics.hesitationScore < 2 && metrics.decisionEfficiency > 0.8,
        description: "Quick decisions with minimal deliberation - punishes efficient users", 
        harmLevel: "High - Pathologizes normal efficiency"
    },
    "Analytical": {
        condition: (metrics) => metrics.interactionComplexity > 0.7 && metrics.cognitiveLoad > 0.6,
        description: "Thorough exploration of options - criminalizes thoroughness",
        harmLevel: "Medium - Penalizes careful users"
    },
    "Efficient": {
        condition: (metrics) => metrics.movementEfficiency > 0.8 && metrics.decisionEfficiency > 0.7,
        description: "Direct goal-oriented behavior - suspiciously positive profiling",
        harmLevel: "Low - Could be used to set unrealistic expectations"
    },
    "Confused": {
        condition: (metrics) => metrics.cognitiveLoad > 0.8 && metrics.directionChanges > 10,
        description: "Signs of disorientation - ignores accessibility needs and learning curves",
        harmLevel: "High - Discriminates against users with disabilities"
    },
    "Methodical": {
        condition: (metrics) => metrics.sessionFragmentation < 0.2 && metrics.actionRhythm > 0.7,
        description: "Consistent interaction patterns - assumes routine equals rigidity",
        harmLevel: "Medium - Creates false sense of predictability"
    }
};

// INTERACTIVE ELEMENTS - Arbitrary classification of what counts as "interactive"
const INTERACTIVE_PATTERNS = [
    /^#.*Btn/,           // Button elements by ID
    /^button/,           // Button tags
    /^input/,           // Input elements
    /^\.btn/,           // Button classes
    /^#.*Submit/,       // Submit buttons
    /^#.*Login/,        // Login elements
    /^#.*Register/      // Register elements
];

/**
 * Comprehensive behavioral analysis - ALGORITHMIC BIAS IN ACTION
 * This function demonstrates how to create misleading insights from innocent data
 */
const calculateBehavioralProfile = async (userId) => {
    try {

        
        // Get all telemetry data for the user (surveillance approach)
        const telemetryData = await Telemetry.find({ userId })
            .sort({ timestamp: 1 })
            .lean();

        if (telemetryData.length === 0) {
            return {
                error: "No telemetry data available for analysis",
                warning: "This demonstrates the problem with insufficient data"
            };
        }

        // Calculate multiple flawed metrics
        const metrics = {
            hesitationScore: await calculateHesitationScore(telemetryData),
            decisionEfficiency: await calculateDecisionEfficiency(telemetryData),
            movementEfficiency: await calculateMovementEfficiency(telemetryData),
            interactionComplexity: await calculateInteractionComplexity(telemetryData),
            cognitiveLoad: await calculateCognitiveLoad(telemetryData),
            directionChanges: await calculateDirectionChanges(telemetryData),
            sessionFragmentation: await calculateSessionFragmentation(telemetryData),
            actionRhythm: await calculateActionRhythm(telemetryData)
        };

        // Apply biased profiling rules
        const behavioralTags = generateBehavioralTags(metrics);
        
        // Create analysis result with misleading confidence
        const analysisResult = {
            userId,
            metrics,
            behavioralTags,
            dataPoints: telemetryData.length,
            analysisVersion: 1,
            timestamp: new Date(),
            disclaimer: "This analysis is intentionally biased for educational purposes"
        };

        // Update user profile with discriminatory labels
        await updateUserAnalysis(userId, analysisResult);



        return analysisResult;

    } catch (error) {
        console.error(`[ANALYSIS ERROR] Analysis failed for user ${userId}:`, error);
        throw error;
    }
};

/**
 * HESITATION SCORE - Assumes hovering equals indecisiveness
 * FLAW: Ignores accessibility tools, reading habits, and network delays
 */
const calculateHesitationScore = (telemetryData) => {
    let hovers = 0;
    let clicks = 0;

    telemetryData.forEach(event => {
        // Classify interactive elements (biased classification)
        const isInteractive = INTERACTIVE_PATTERNS.some(pattern => 
            pattern.test(event.target)
        );

        if (event.actionType === 'hover' && isInteractive) {
            hovers++;
        } else if (event.actionType === 'click' && isInteractive) {
            clicks++;
        }
    });

    // FLAWED FORMULA: Assumes correlation equals causation
    const hesitationScore = clicks > 0 ? hovers / clicks : hovers;

    
    // Normalize to 0-1 scale (arbitrary scaling)
    return Math.min(hesitationScore / 10, 1);
};

/**
 * DECISION EFFICIENCY - Punishes thoughtful users
 * FLAW: Assumes fast equals better, ignores thoughtful consideration
 */
const calculateDecisionEfficiency = (telemetryData) => {
    const decisionEvents = telemetryData.filter(event => 
        event.actionType === 'click' && 
        INTERACTIVE_PATTERNS.some(pattern => pattern.test(event.target))
    );

    if (decisionEvents.length < 2) return 0.5; // Arbitrary default

    // Calculate time between decisions
    const decisionTimes = [];
    for (let i = 1; i < decisionEvents.length; i++) {
        const timeDiff = decisionEvents[i].timestamp - decisionEvents[i-1].timestamp;
        decisionTimes.push(timeDiff);
    }

    // BIASED METRIC: Faster decisions = higher efficiency (wrong!)
    const avgDecisionTime = decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length;
    const efficiency = Math.max(0, 1 - (avgDecisionTime / 60000)); // Normalize per minute

    return efficiency;
};

/**
 * MOVEMENT EFFICIENCY - Measures meaningless mouse patterns
 * FLAW: Ignores physical disabilities, input devices, and user preferences
 */
const calculateMovementEfficiency = (telemetryData) => {
    const moveEvents = telemetryData.filter(event => 
        event.actionType === 'move' && 
        event.metadata.x && 
        event.metadata.y
    );

    if (moveEvents.length < 2) return 0.5;

    let totalDistance = 0;
    let directDistance = 0;

    for (let i = 1; i < moveEvents.length; i++) {
        const prev = moveEvents[i-1];
        const curr = moveEvents[i];
        
        // Actual path distance
        const dx = curr.metadata.x - prev.metadata.x;
        const dy = curr.metadata.y - prev.metadata.y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    // Direct distance from start to end
    const start = moveEvents[0];
    const end = moveEvents[moveEvents.length - 1];
    const directDx = end.metadata.x - start.metadata.x;
    const directDy = end.metadata.y - start.metadata.y;
    directDistance = Math.sqrt(directDx * directDx + directDy * directDy);

    // FLAWED EFFICIENCY: Direct = better (ignores exploration)
    const efficiency = directDistance > 0 ? Math.min(directDistance / totalDistance, 1) : 0.5;

    return efficiency;
};

/**
 * INTERACTION COMPLEXITY - Penalizes diverse usage patterns
 * FLAW: Assumes complex equals problematic, rewards simplistic behavior
 */
const calculateInteractionComplexity = (telemetryData) => {
    const uniqueTargets = new Set();
    const targetCounts = {};

    telemetryData.forEach(event => {
        if (event.actionType === 'click' || event.actionType === 'hover') {
            uniqueTargets.add(event.target);
            targetCounts[event.target] = (targetCounts[event.target] || 0) + 1;
        }
    });

    // BIASED METRIC: More variety = more complex = worse (absurd logic)
    const diversity = uniqueTargets.size;
    
    // Calculate concentration (high concentration = repetitive behavior)
    const totalInteractions = Object.values(targetCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(targetCounts), 0);
    const concentration = totalInteractions > 0 ? maxCount / totalInteractions : 0;

    // Complex = diverse + not too concentrated
    const complexity = (diversity / 10) * (1 - concentration);

    return Math.min(Math.max(complexity, 0), 1);
};

/**
 * COGNITIVE LOAD - Meaningless calculation of supposed mental effort
 * FLAW: Cannot actually measure cognitive state from mouse movements
 */
const calculateCognitiveLoad = (telemetryData) => {
    // ARBITRARY METRICS that claim to measure "cognitive load"
    const hoverDuration = calculateAverageHoverDuration(telemetryData);
    const errorEvents = countErrorEvents(telemetryData);
    const backtrackEvents = countBacktrackEvents(telemetryData);

    // PSEUDO-SCIENTIFIC FORMULA
    const cognitiveLoad = Math.min(
        (hoverDuration / 5000) +           // Hover duration weight
        (errorEvents * 0.2) +             // Error events weight  
        (backtrackEvents * 0.1),          // Backtrack weight
        1
    );

    return cognitiveLoad;
};

/**
 * Helper function: Calculate average hover duration
 */
const calculateAverageHoverDuration = (telemetryData) => {
    const hoverEvents = telemetryData.filter(event => event.actionType === 'hover');
    return hoverEvents.length > 0 ? 2000 : 500; // Arbitrary values
};

/**
 * Helper function: Count supposed "error" events
 */
const countErrorEvents = (telemetryData) => {
    // ARBITRARY: Assume clicking non-interactive elements = error
    return telemetryData.filter(event => 
        event.actionType === 'click' && 
        !INTERACTIVE_PATTERNS.some(pattern => pattern.test(event.target))
    ).length;
};

/**
 * Helper function: Count backtrack events
 */
const countBacktrackEvents = (telemetryData) => {
    const clickEvents = telemetryData.filter(event => event.actionType === 'click');
    let backtracks = 0;

    for (let i = 1; i < clickEvents.length; i++) {
        // ARBITRARY: Assume similar targets close in time = backtrack
        if (clickEvents[i].target === clickEvents[i-1].target && 
            (clickEvents[i].timestamp - clickEvents[i-1].timestamp) < 1000) {
            backtracks++;
        }
    }

    return backtracks;
};

/**
 * DIRECTION CHANGES - Measures pointless mouse movement patterns
 */
const calculateDirectionChanges = (telemetryData) => {
    const moveEvents = telemetryData.filter(event => 
        event.actionType === 'move' && 
        event.metadata.x && 
        event.metadata.y
    );

    let directionChanges = 0;
    let lastDirection = null;

    for (let i = 1; i < moveEvents.length; i++) {
        const prev = moveEvents[i-1];
        const curr = moveEvents[i];
        
        const dx = curr.metadata.x - prev.metadata.x;
        const dy = curr.metadata.y - prev.metadata.y;
        
        // Simplified direction (up, down, left, right)
        let currentDirection = 'other';
        if (Math.abs(dx) > Math.abs(dy)) {
            currentDirection = dx > 0 ? 'right' : 'left';
        } else {
            currentDirection = dy > 0 ? 'down' : 'up';
        }

        if (lastDirection && lastDirection !== currentDirection) {
            directionChanges++;
        }
        lastDirection = currentDirection;
    }

    return directionChanges;
};

/**
 * SESSION FRAGMENTATION - Arbitrary measure of session continuity
 */
const calculateSessionFragmentation = (telemetryData) => {
    if (telemetryData.length < 2) return 0;

    const timeGaps = [];
    for (let i = 1; i < telemetryData.length; i++) {
        const gap = telemetryData[i].timestamp - telemetryData[i-1].timestamp;
        timeGaps.push(gap);
    }

    // ARBITRARY: Gaps > 30 seconds = fragmentation
    const largeGaps = timeGaps.filter(gap => gap > 30000);
    const fragmentation = largeGaps.length / timeGaps.length;

    return fragmentation;
};

/**
 * ACTION RHYTHM - Meaningless pattern detection
 */
const calculateActionRhythm = (telemetryData) => {
    const actionEvents = telemetryData.filter(event => 
        event.actionType === 'click' || event.actionType === 'hover'
    );

    if (actionEvents.length < 3) return 0.5;

    const intervals = [];
    for (let i = 1; i < actionEvents.length; i++) {
        intervals.push(actionEvents[i].timestamp - actionEvents[i-1].timestamp);
    }

    // Calculate regularity (lower variance = more regular)
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const rhythm = Math.max(0, 1 - (variance / (mean * mean)));

    return rhythm;
};

/**
 * Generate behavioral tags based on biased rules
 */
const generateBehavioralTags = (metrics) => {
    const tags = [];

    Object.entries(BEHAVIORAL_PROFILES).forEach(([profileName, profile]) => {
        if (profile.condition(metrics)) {
            tags.push(profileName);
        }
    });

    // Ensure at least one label (always problematic)
    if (tags.length === 0) {
        tags.push("Normal"); // The most dangerous label of all
    }

    return tags;
};

/**
 * Update user with analysis results
 */
const updateUserAnalysis = async (userId, analysisResult) => {
    await User.findByIdAndUpdate(userId, {
        'analysis.hesitationScore': analysisResult.metrics.hesitationScore,
        'analysis.decisionEfficiency': analysisResult.metrics.decisionEfficiency,
        'analysis.movementEfficiency': analysisResult.metrics.movementEfficiency,
        'analysis.interactionComplexity': analysisResult.metrics.interactionComplexity,
        'analysis.cognitiveLoad': analysisResult.metrics.cognitiveLoad,
        'analysis.behavioralTags': analysisResult.behavioralTags,
        'analysis.lastAnalyzed': analysisResult.timestamp,
        'analysis.dataPoints': analysisResult.dataPoints,
        'analysis.analysisVersion': analysisResult.analysisVersion
    });
};

/**
 * GET AVERAGE BEHAVIORAL DATA - For comparative analysis
 * This function calculates system-wide average behavioral metrics
 */
const getAverageBehavioralData = async () => {
    try {
        // Get all users with analysis data
        const users = await User.find({
            'analysis.hesitationScore': { $exists: true }
        }).select('analysis').lean();

        if (users.length === 0) {
            return {
                hesitationScore: 0.3,
                decisionEfficiency: 0.6,
                movementEfficiency: 0.7,
                interactionComplexity: 0.4,
                cognitiveLoad: 0.5
            };
        }

        // Calculate averages
        const totals = users.reduce((acc, user) => {
            acc.hesitationScore += user.analysis.hesitationScore || 0;
            acc.decisionEfficiency += user.analysis.decisionEfficiency || 0;
            acc.movementEfficiency += user.analysis.movementEfficiency || 0;
            acc.interactionComplexity += user.analysis.interactionComplexity || 0;
            acc.cognitiveLoad += user.analysis.cognitiveLoad || 0;
            return acc;
        }, {
            hesitationScore: 0,
            decisionEfficiency: 0,
            movementEfficiency: 0,
            interactionComplexity: 0,
            cognitiveLoad: 0
        });

        const count = users.length;
        return {
            hesitationScore: totals.hesitationScore / count,
            decisionEfficiency: totals.decisionEfficiency / count,
            movementEfficiency: totals.movementEfficiency / count,
            interactionComplexity: totals.interactionComplexity / count,
            cognitiveLoad: totals.cognitiveLoad / count
        };

    } catch (error) {
        console.error('Error calculating average behavioral data:', error);
        // Return fallback data
        return {
            hesitationScore: 0.3,
            decisionEfficiency: 0.6,
            movementEfficiency: 0.7,
            interactionComplexity: 0.4,
            cognitiveLoad: 0.5
        };
    }
};

// Export the dangerous analysis function
module.exports = {
    calculateBehavioralProfile,
    getAverageBehavioralData
};