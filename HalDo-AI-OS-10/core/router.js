// ==========================================
// HalDo Router System
// ==========================================


const HalDoRouter = {


    open(path) {

        window.location.href = path;

    },


    back() {

        window.history.back();

    }


};


window.HalDoRouter = HalDoRouter;