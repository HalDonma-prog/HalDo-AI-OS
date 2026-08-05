// ==========================================
// HalDo AI OS Permissions
// ==========================================

const HalDoPermissions = {

    roles: {

        admin: [
            "create",
            "edit",
            "delete",
            "block",
            "settings",
            "updates"
        ],


        user: [
            "create",
            "edit",
            "delete"
        ]

    },


    check(role, action) {

        return this.roles[role]
            ?.includes(action);

    }

};


window.HalDoPermissions = HalDoPermissions;