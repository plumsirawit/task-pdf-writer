
function ToastrUtil(){

    ToastrUtil.config = function(){
        toastr.options.closeMethod = 'fadeOut';
        toastr.options.closeDuration = 300;
        toastr.options.closeEasing = 'swing';
        toastr.options.rtl = false;
        toastr.options.positionClass = "toast-bottom-center";
    }

    ToastrUtil.info = function(text, title){
        ToastrUtil.config();
        return toastr.info(text, title);
    }

    ToastrUtil.success = function(text, title){
        ToastrUtil.config();
        return toastr.success(text, title);
    }

    ToastrUtil.error = function(text, title){
        ToastrUtil.config();
        return toastr.error(text, title);
    }

}

ToastrUtil();
