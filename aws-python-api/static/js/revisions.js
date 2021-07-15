var task_version_url, task_type,
    csrf_token,
    task_versions,
    version_id_to_revert,
    revert_url,
    view_all;

$(document).ready(function () {
    getVersions();
});

function selectVersion(id){
    $(id).addClass('active').siblings().removeClass('active');
}

function diff(id1, id2){
    var text1, text2;
    $.each(task_versions, function(index, version) {
        if (version.id == id1)
            text1 = version.text;
        if (version.id == id2)
            text2 = version.text;
    });
    if (!text2) {
        view_version(text1, id1)
    } else {
        var diff_fragment = DiffUtil.getDiffFragment(text2, text1);
        $('#myversion').html(diff_fragment);
        selectVersion('#version-' + id1);
    }

}

function view_version(text, id){
    selectVersion('#version-' + id);
    $('#myversion').html(text);
};


function getVersions() {
    $.ajax({
        url: task_version_url,
        data: {
            task_type: task_type,
            view_all: view_all,
            csrfmiddlewaretoken: csrf_token
        },
        type: "GET",
        success: function (response) {
            task_versions = response.versions;

            // onclick first row
            if (task_versions[0]) {
                if(task_versions[1])
                    diff(task_versions[0].id, task_versions[1].id);
                else
                    view_version(task_versions[0].text, task_versions[0].id);
            }
        }
    });
    return false;
}

function revert(version_id) {
    bootbox.confirm({
        title: 'Confirm',
        message: "Are you sure to revert to this revision?",
        buttons: {
            confirm: {label: 'Revert'},
        },
        callback: function (result) {
            if (result)
                applyRevert(version_id);
        }
    });
}

function applyRevert(version_id) {
    $.ajax({
        url: revert_url,
        data: {
            id: version_id,
            csrfmiddlewaretoken: csrf_token
        },
        type: "POST",
        success: function (response) {
            location.reload();
        },
    });
}
