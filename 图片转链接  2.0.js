"ui";

ui.layout(
    <vertical>
        <text id="text_test" paddingTop="10" textSize="19sp" text="选择图片后点击上传"/>
        <horizontal padding="90 20 10 10">
            <button id="calc" align="center">选择图片</button>
            <button id="up" align="center">上传</button>
        </horizontal>
        <text id="text_url" paddingTop="10" textSize="19sp"/>
    </vertical>
);

var ResultIntent = {
    intentCallback: {},
    init: function() {
        activity.getEventEmitter().on("activity_result", (requestCode, resultCode, data) => {
            this.onActivityResult(requestCode, resultCode, data);
        });
    },
    startActivityForResult: function(intent, callback) {
        var i;
        for (i = 0; i < 65536; i++) {
            if (!(i in this.intentCallback)) break;
        }
        if (i >= 65536) {
            toast("启动Intent失败：同时请求的Intent过多");
            return;
        }
        this.intentCallback[i] = callback;
        activity.startActivityForResult(intent, i);
    },
    onActivityResult: function(requestCode, resultCode, data) {
        var cb = this.intentCallback[requestCode];
        if (!cb) return;
        delete this.intentCallback[requestCode];
        cb(resultCode, data);
    }
};
ResultIntent.init();

function URIUtils_uriToFile(uri) { //Source : https://www.cnblogs.com/panhouye/archive/2017/04/23/6751710.html
    var r = null,
        cursor, column_index, selection = null,
        selectionArgs = null,
        isKitKat = android.os.Build.VERSION.SDK_INT >= 19,
        docs;
    if (uri.getScheme().equalsIgnoreCase("content")) {
        if (isKitKat && android.provider.DocumentsContract.isDocumentUri(activity, uri)) {
            if (String(uri.getAuthority()) == "com.android.externalstorage.documents") {
                docs = String(android.provider.DocumentsContract.getDocumentId(uri)).split(":");
                if (docs[0] == "primary") {
                    return android.os.Environment.getExternalStorageDirectory() + "/" + docs[1];
                }
            } else if (String(uri.getAuthority()) == "com.android.providers.downloads.documents") {
                uri = android.content.ContentUris.withAppendedId(
                    android.net.Uri.parse("content://downloads/public_downloads"),
                    parseInt(android.provider.DocumentsContract.getDocumentId(uri))
                );
            } else if (String(uri.getAuthority()) == "com.android.providers.media.documents") {
                docs = String(android.provider.DocumentsContract.getDocumentId(uri)).split(":");
                if (docs[0] == "image") {
                    uri = android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if (docs[0] == "video") {
                    uri = android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if (docs[0] == "audio") {
                    uri = android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }
                selection = "_id=?";
                selectionArgs = [docs[1]];
            }
        }
        try {
            cursor = activity.getContentResolver().query(uri, ["_data"], selection, selectionArgs, null);
            if (cursor && cursor.moveToFirst()) {
                r = String(cursor.getString(cursor.getColumnIndexOrThrow("_data")));
            }
        } catch (e) {
            log(e)
        }
        if (cursor) cursor.close();
        return r;
    } else if (uri.getScheme().equalsIgnoreCase("file")) {
        return String(uri.getPath());
    }
    return null;
}

function startChooseFile(mimeType, callback) {
    var i = new android.content.Intent(android.content.Intent.ACTION_GET_CONTENT);
    i.setType(mimeType);
    ResultIntent.startActivityForResult(i, function(resultCode, data) {
        if (resultCode != activity.RESULT_OK) return;
        var f = URIUtils_uriToFile(data.getData());
        ui.run(() => {
            ui.text_test.setText(f);
        });
    });
}

ui.calc.click(() => {
    startChooseFile("*/*");
});

ui.up.click(() => {
    threads.start(function() {
        let wsx = 上传图片(ui.text_test.text());
        ui.run(() => {
            ui.text_url.setText(wsx);
        });
    });
});
ui.text_url.click(() =>{
        let xbj = ui.text_url.text();
    if (xbj) {
        setClip(xbj);
        toast("复制成功");
    }
});


function 上传图片(path) {
    var url = "http://pic.sogou.com/pic/upload_pic.jsp";
    var res = http.postMultipart(url, {
        "file": open(path),
    });
    var t = res.body.string();
    return t;
}