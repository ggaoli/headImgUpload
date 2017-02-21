/**
 * Created by gao li on 2016/10/14.
 */
jQuery(function() {
    //图片上传服务器地址
    // var uploadSaveServe='http://192.168.212.110/fileCenter/fileUpload.sp?act=uploadSave&appId=00000001&caseId=00000014',
    var uploadSaveServe='../server/fileupload.php',
        uploadClipServe='';

    var $ = jQuery, $wrap = $('#uploader'),
        $queue = $('<ul class="filelist"></ul>').appendTo($wrap.find('.queueList')),
        $statusBar = $wrap.find('.statusBar'), $info = $statusBar.find('.info'),
        $upload = $wrap.find('.uploadBtn'),
        //服务端传回来的图片地址
        serverImg,



        $placeHolder = $wrap.find('.placeholder'),
        fileCount = 0, fileSize = 0, img = new Image(),
        isSave = false,

        ratio = window.devicePixelRatio || 1,

        // 缩略图大小
        thumbnailWidth = ratio,
        thumbnailHeight = ratio,

        // 所有文件的进度信息，key为file id
        percentages = {},

        supportTransition = (function () {
        var s = document.createElement('p').style,
            r = 'transition' in s ||
                'WebkitTransition' in s ||
                'MozTransition' in s ||
                'msTransition' in s ||
                'OTransition' in s;
        s = null;
        return r;
    })();

    //缩略图X Y坐标
    var boundx,
        boundy;
    var jcropApi;
    if ( !WebUploader.Uploader.support() ) {
        alert( 'Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
        throw new Error( 'WebUploader does not support the browser you are using.' );
    }

    //dom节点缓存
    var htmlDom={
        headDefault:$("#head-default"),
        previewPane:$('#preview-pane'),
        uploaderBtnSure:$('#uploaderBtnSure'),
        defaultBtnSure:$('#defaultBtnSure'),
        headImgShow:$('#headImgShow')
    };

    // 实例化
    var uploader = WebUploader.create({
        // 自动上传
        auto: true,
        pick: {
            id: '#filePicker',
            label: '点击选择图片'
        },
        dnd: '#uploader .queueList',
        paste: document.body,
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            // mimeTypes: 'image/*'
            mimeTypes: 'image/jpg,image/jpeg,image/png'
        },
        // swf文件路径
        swf: '../javascript/Uploader.swf',
        disableGlobalDnd: true,
        fileNumLimit: 1,
        // server: '../server/fileupload.php',
        server: uploadSaveServe,
        fileSizeLimit: 5 * 1024 * 1024,    // 200 M
        fileSingleSizeLimit: 1024 * 1024    // 50 M
    });
    // 添加“添加文件”的按钮，
    uploader.addButton({
        id: '#filePicker2',
        label: '重新上传'
    });


    
    // 当文件上传成功时触发
    uploader.onUploadSuccess = function(file,response){
        serverImg = response.url;
        fileCount++;
        fileSize += file.size;
        if ( fileCount === 1 ) {
            $placeHolder.hide();
            $placeHolder.addClass( 'element-invisible' );
            $statusBar.show();
        }
        
        $placeHolder.hide();
        $placeHolder.addClass( 'element-invisible' );
        
        var $li = $( '<li id="' + file.id + '" class="file-item thumbnail">' +
                '<p class="title">' + file.name + '</p>' +
                '<p class="imgWrap"><img></p>'+
                '</li>' ),
            $img = $li.find('img');
        $img.attr( 'src', response.url).attr('id', "cropbox");
        $queue.html("").append( $li );
        
        var cropBox = $('#cropbox');
        img.src = cropBox.attr("src");
        
        uploader.reset();

    };

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.onUploadComplete=function(file){
        $('#crop-img-120').find('img').attr('src',serverImg);
        $('#crop-img-60').find('img').attr('src',serverImg);

        $('#preview-pane').find('.crop-img-container img').css({
            'width':'inherit',
            'height':'inherit',
            'margin-left':'0',
            'margin-top':'0'
        });

        //按钮显示事件
        htmlDom.uploaderBtnSure.show();
        htmlDom.headDefault.find('li').removeClass('on');
        htmlDom.defaultBtnSure.hide();

        initJcrop();
        uploader.removeFile(file);

    };
    function initJcrop(){
        $wrap.find('.filelist li p.imgWrap img').Jcrop({
            minSize: [30, 30],
            maxSize: [400, 400],
            aspectRatio: 1,
            setSelect: [0, 0, 200, 200],
            onChange: updatePreview,
            onSelect: updatePreview
        },function () {
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            jcropApi = this;
        });
    }
    
    function updatePreview(c){
        //120*120px
        if (parseInt(c.w) > 0){
            var rx1 = 120 / c.w;
            var ry1 = 120 / c.h;
            $('#crop-img-120').find('img').css({
                width: Math.round(rx1 * boundx) + 'px',
                height: Math.round(ry1 * boundy) + 'px',
                marginLeft: '-' + Math.round(rx1 * c.x) + 'px',
                marginTop: '-' + Math.round(ry1 * c.y) + 'px'
            });
        }
        //60*60px
        if (parseInt(c.w) > 0){
            var rx2 = 60 / c.w;
            var ry2 = 60 / c.h;
            $('#crop-img-60').find('img').css({
                width: Math.round(rx2 * boundx) + 'px',
                height: Math.round(ry2 * boundy) + 'px',
                marginLeft: '-' + Math.round(rx2 * c.x) + 'px',
                marginTop: '-' + Math.round(ry2 * c.y) + 'px'
            });
        }
    }

    //重新上传按钮绑定事件
    $('#filePicker2').on('click',function(){
        // isSave = true;
    });

    //当文件上传错误时触发
    uploader.onError = function( code ) {
        console.log( 'Eroor: ' + code );
    };


    //tab切换
    new o_tab().init( "headimg_upload","li","head-img-upload_","on","",1,"");
    $('#popup-head-upload').mask().noClick();//配置对象#popup-head-upload遮罩层不能点击

    var defaultImgSrc;

    //推荐头像加载
    $.ajax({
        type:"GET",
        url:'../javascript/post-images.json',
        dataType:'json',
        // async: false,
        beforeSend:function () {},
        success:function (headImgData) {
            var headHtml='',
                headTitle='';
            for(var j=0;j<headImgData.headType.length;j++){
                for (var i=0;i<30;i++){
                    headTitle='<div class="title">'+headImgData.headType[j].title+'</div>';
                    headHtml +='<li><img src="../images/head-images/'+headImgData.headType[j].file+'/'+(i+1)+'.jpg" alt=""><i class="png"></i></li>';
                }
                headHtml=headTitle+'<ul class="clearfix">'+headHtml+'</ul>';
                htmlDom.headDefault.append(headHtml);
                headHtml='';
            }

        },
        complete:function () {}

    });

    //推荐头像的点击事件
    htmlDom.headDefault.on('click','li',function () {
        var _this=$(this);
        htmlDom.headDefault.find('li').removeClass('on');
        _this.addClass('on');
        var previewPaneImg=htmlDom.previewPane.find('.crop-img-container img');
        defaultImgSrc=_this.find('img').attr('src');
        previewPaneImg.attr('src',defaultImgSrc);
        previewPaneImg.css({
            'width':'100%',
            'height':'100%',
            'margin-left':'0',
            'margin-top':'0'
        });
        //初始化本地上传
        $wrap.find('.placeholder').removeClass( 'element-invisible').show();
        $wrap.find('.filelist li').remove();
        htmlDom.defaultBtnSure.show();
    });

    //推荐头像点击确定事件
    $(document).on('click','#defaultBtnSure',function () {
        htmlDom.headImgShow.find('img')[0].src=defaultImgSrc;
    });

    //自定义上传点击确定事件
    $(document).on('click','#uploaderBtnSure',function () {

    });

    //头像上传弹出层强制居中
    $(document).on('click','[reveal-model-id=\'popup-head-upload\']',function () {
        var rowUpload=$('.head-img-layout').find('.box-content');
        rowUpload.css({
            'position':'fixed',
            left:($(window).width()-rowUpload.width())/2,
            top:($(window).height()-rowUpload.height())/2
        }) ;
    });

});

