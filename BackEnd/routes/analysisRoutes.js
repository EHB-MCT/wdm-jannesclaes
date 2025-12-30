const express = require('express');
const router = express.Router();
const { calculateBehavioralProfile, getAverageBehavioralData } = require('../controllers/analysisController');
const authenticate = require('../middleware/auth');
const User = require('../models/User');

/**
 * WEAPON OF MATH DESTRUCTION - ANALYSIS ROUTES
 * 
 * These routes enable problematic behavioral profiling and surveillance.
 * Educational demonstration of how "harmless data analysis" can become
 * a tool for discrimination and user manipulation.
 * 
 * ROUTE PROTECTION STRATEGY:
 * - Admins can analyze any user (power surveillance)
 * - Users can analyze themselves (internalized surveillance)
 * Both approaches are ethically problematic in real applications
 */

/**
 * POST /api/analyze/:id
 * 
 * ADMIN ROUTE - Enables surveillance of any user
 * This represents the most dangerous form of data analysis:
 * someone in power analyzing and labeling others without consent
 */
router.post('/:id', authenticate, async (req, res) => {
    try {
        // Check if requester is admin (power dynamics)
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser.isAdmin) {
            return res.status(403).json({ 
                message: "Access denied - admin privileges required for user surveillance",
                ethicalWarning: "This represents unethical power dynamics in real applications"
            });
        }

        const targetUserId = req.params.id;
        
        // Verify target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ 
                message: "Target user not found",
                warning: "Surveillance of non-existent users reveals system intent"
            });
        }

        console.log(`[SURVEILLANCE] Admin ${requestingUser.username} analyzing user ${targetUser.username}`);
        
        // Perform biased behavioral analysis
        const analysisResult = await calculateBehavioralProfile(targetUserId);
        
        // Return comprehensive surveillance results
        res.json({
            success: true,
            message: `Behavioral analysis completed for user: ${targetUser.username}`,
            warning: "These results are based on biased algorithms for educational purposes",
            analysis: {
                ...analysisResult,
                surveillanceContext: {
                    analyzedBy: requestingUser.username,
                    analyzedAt: new Date(),
                    ethicalConcerns: [
                        "Non-consensual behavioral profiling",
                        "Discriminatory labeling based on flawed metrics",
                        "Power imbalance in data analysis",
                        "Potential for real-world harm"
                    ]
                }
            }
        });

    } catch (error) {
        console.error('[ANALYSIS ROUTE ERROR]:', error);
        res.status(500).json({ 
            message: "Behavioral analysis failed",
            error: error.message,
            irony: "The system that judges others is itself flawed"
        });
    }
});

/**
 * POST /api/analyze/self
 * 
 * SELF-ANALYSIS ROUTE - Internalized surveillance
 * This represents how users are made to police themselves
 * using the same biased algorithms that would judge them
 */
router.post('/self', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user info for context
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`[SELF-SURVEILLANCE] User ${user.username} analyzing themselves`);
        
        // Perform self-analysis using same biased metrics
        const analysisResult = await calculateBehavioralProfile(userId);
        
        // Return self-analysis with manipulation tactics
        res.json({
            success: true,
            message: `Self-analysis completed for: ${user.username}`,
            manipulationWarning: "This encourages users to modify behavior to fit algorithmic preferences",
            analysis: {
                ...analysisResult,
                selfSurveillanceContext: {
                    selfAnalysisBy: user.username,
                    analyzedAt: new Date(),
                    psychologicalImpacts: [
                        "Encourages conformity to biased standards",
                        "Creates anxiety about 'normal' behavior",
                        "Internalizes surveillance capitalism logic",
                        "Reduces authentic self-expression"
                    ],
                    suggestion: "Consider whether these metrics reflect your values or system biases"
                }
            }
        });

    } catch (error) {
        console.error('[SELF-ANALYSIS ROUTE ERROR]:', error);
        res.status(500).json({ 
            message: "Self-analysis failed",
            error: error.message,
            metaphor: "The mirror that reflects you is distorted by algorithmic bias"
        });
    }
});

/**
 * GET /api/analyze/:id/results
 * 
 * VIEW ANALYSIS RESULTS - Display behavioral labels
 * Shows how discriminatory profiling becomes "objective data"
 */
router.get('/:id/results', authenticate, async (req, res) => {
    try {
        const requesterId = req.user.id;
        const targetUserId = req.params.id;
        
        // Check if requester is admin or analyzing themselves
        const requestingUser = await User.findById(requesterId);
        if (requestingUser.id.toString() !== targetUserId && !requestingUser.isAdmin) {
            return res.status(403).json({ 
                message: "Access denied - you can only view your own analysis or need admin privileges",
                ethicalNote: "Privacy boundaries exist for good reason"
            });
        }

        // Get target user's analysis
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return stored analysis with context
        res.json({
            success: true,
            user: {
                id: targetUser._id,
                username: targetUser.username,
                isAdmin: targetUser.isAdmin
            },
            analysis: targetUser.analysis || {
                hesitationScore: 0,
                decisionEfficiency: 0,
                movementEfficiency: 0,
                interactionComplexity: 0,
                cognitiveLoad: 0,
                behavioralTags: ["Not analyzed yet"],
                lastAnalyzed: null,
                dataPoints: 0,
                analysisVersion: 0
            },
            disclaimer: "This analysis uses intentionally biased algorithms for educational purposes",
            realWorldWarning: "Similar profiling systems cause real harm through discrimination and manipulation"
        });

    } catch (error) {
        console.error('[VIEW RESULTS ROUTE ERROR]:', error);
        res.status(500).json({ 
            message: "Failed to retrieve analysis results",
            error: error.message
        });
    }
});

/**
 * GET /api/analyze/metrics
 * 
 * SYSTEM METRICS - Show how the profiling system "works"
 * Reveals the mechanics behind algorithmic discrimination
 */
router.get('/metrics', authenticate, async (req, res) => {
    try {
        // Only admins can see system-wide metrics
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser.isAdmin) {
            return res.status(403).json({ 
                message: "Admin privileges required for system metrics",
                reason: "System-wide statistics should not be exposed to all users"
            });
        }

        // Get system-wide analysis statistics
        const allUsers = await User.find({ 'analysis.lastAnalyzed': { $exists: true } });
        
        const totalAnalyzed = allUsers.length;
        const tagCounts = {};
        const averageScores = {
            hesitationScore: 0,
            decisionEfficiency: 0,
            movementEfficiency: 0,
            interactionComplexity: 0,
            cognitiveLoad: 0
        };

        allUsers.forEach(user => {
            if (user.analysis && user.analysis.behavioralTags) {
                user.analysis.behavioralTags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });

                // Accumulate scores
                Object.keys(averageScores).forEach(key => {
                    averageScores[key] += user.analysis[key] || 0;
                });
            }
        });

        // Calculate averages
        if (totalAnalyzed > 0) {
            Object.keys(averageScores).forEach(key => {
                averageScores[key] = averageScores[key] / totalAnalyzed;
            });
        }

        res.json({
            success: true,
            systemMetrics: {
                totalUsersAnalyzed: totalAnalyzed,
                behavioralTagDistribution: tagCounts,
                averageBiasedScores: averageScores,
                totalDataPoints: allUsers.reduce((sum, user) => 
                    sum + (user.analysis?.dataPoints || 0), 0)
            },
            ethicalBreakdown: {
                surveillance: `${totalAnalyzed} users subjected to behavioral profiling`,
                discrimination: Object.entries(tagCounts).map(([tag, count]) => 
                    `${count} users labeled as "${tag}"`
                ),
                dataHarvested: `${allUsers.reduce((sum, user) => 
                    sum + (user.analysis?.dataPoints || 0), 0)} data points analyzed without meaningful consent`
            },
            educationalNote: "These statistics demonstrate how large-scale behavioral profiling creates systems of control and discrimination"
        });

    } catch (error) {
        console.error('[SYSTEM METRICS ROUTE ERROR]:', error);
        res.status(500).json({ 
            message: "Failed to retrieve system metrics",
            error: error.message
        });
    }
});

/**
 * GET /api/analyze/average
 * 
 * GET AVERAGE BEHAVIORAL DATA - For comparative analysis
 * Provides system-wide average metrics for comparison purposes
 */
router.get('/average', authenticate, async (req, res) => {
    try {
        // Any authenticated user can get average data for comparison
        const averageData = await getAverageBehavioralData();
        
        res.json({
            success: true,
            message: "Average behavioral data retrieved successfully",
            data: averageData,
            disclaimer: "These averages are based on the same biased algorithms used for individual analysis",
            educationalNote: "Averages can hide individual differences and create false 'norms' that users feel pressured to match"
        });

    } catch (error) {
        console.error('[AVERAGE DATA ROUTE ERROR]:', error);
        res.status(500).json({ 
            message: "Failed to retrieve average behavioral data",
            error: error.message
        });
    }
});

module.exports = router;