// ==========================================
// HalDo Permissions System
// ==========================================


const HalDoPermissions = {


    roles:{


        admin:[

            "create",
            "edit",
            "delete",
            "block",
            "update"

        ],


        user:[

            "use",
            "edit"

        ]


    },


    check(role,permission){


        return this.roles[role]
        ?.includes(permission);


    }


};


window.HalDoPermissions =
HalDoPermissions;