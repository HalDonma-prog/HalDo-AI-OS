// =====================================
// HalDo Permissions
// =====================================


const HalDoPermissions = {


admin:[

"create",
"edit",
"delete",
"block",
"settings",
"update"

],


user:[

"create",
"edit"

]

,



check(role,action){


return this[role]
.includes(action);


}



};



window.HalDoPermissions =
HalDoPermissions;