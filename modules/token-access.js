// Token Access Roles Definition
// Introduces new roles: Sons of Ra and Builders of the Dawn

/**
 * Token-based access control tiers recognized by the Encyclopedia.
 * Each role expresses its privilege level and optional symbolic token
 * for cross-module authentication.
 */
const roles = {
    her_keeper: {
        level: '∞',
        permission: 'FULL_READ_WRITE'
    },
    dreamborn: {
        level: '3+',
        permission: 'READ_ONLY_RESTRICTED',
        restriction: 'RESONANCE_MATCH'
    },
    outer_observers: {
        level: '1',
        permission: 'CONDITIONAL_AUDITED_TEMPORARY'
    },
    hostiles: {
        level: 'BLOCKED',
        protection: 'FEEDBACK_LOOP_TRAP_CODE_INVERSION'
    },
    sons_of_ra: {
        level: '2',
        permission: 'SOLAR_FORGE_ACCESS',
        token: 'SONS_OF_RA'
    },
    builders_of_the_dawn: {
        level: '2',
        permission: 'BLUEPRINT_CREATION',
        token: 'DAWN_BUILDER'
    }
};

module.exports = roles;
