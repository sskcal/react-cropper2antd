import React, { useRef, useCallback } from 'react'
import { Modal,message } from 'antd'
import { useControllableValue } from 'ahooks'
import Cropper from "react-cropper"
import "./index.less"
import "cropperjs/dist/cropper.css"

export default function Demo(props) {
    const defaultValue = {
        file: '',
        fileList: [],
        title: '',// Modal的title
        modalWidth: 0,//Modal的宽度,传百分比用字符串，传像素用数值
        visible: false,//Modal的显示控制
        imgUrl: '',
        width: 500,
        height: 400,
        execBeforUpload: {},
        MAX_FILE_SIZE: 1024 * 1024 * 5,//默认上传5M
    }
    const { children } = props
    const [state, setState] = useControllableValue(props, { defaultValue })
    const { modalWidth, visible, imgUrl, width, height, title } = state
    const cropperRef = useRef(null)


    //移动选中图片选择框时触发此动作
    // const onCrop = () => {
        // const imageElement = cropperRef?.current
        // const cropper = imageElement?.cropper
        // console.log(cropper.getCroppedCanvas().toDataURL())
    // }

    /**
     * Upload
     */
    const renderUpload = useCallback(() => {
        const upload = Array.isArray(children) ? children[0] : children;
        const { beforeUpload, accept, ...restUploadProps } = upload.props;


        return {
            ...upload,
            props: {
                ...restUploadProps,
                accept: accept || 'image/*',
                beforeUpload: (file, fileList) => new Promise((resolve, reject) => {
                    const imgUrl = window.URL.createObjectURL(file)
                    if (!file) {
                        message.warning("请选择图片")
                        return false
                    }
                    if (file.type.split('/')[0]!=='image') {
                        message.warning("只能上传图片")
                        return false
                    }
                    if (file.size > state.MAX_FILE_SIZE) {
                        message.warning("选择上传的文件超过" + state.MAX_FILE_SIZE)
                        return false
                    }
                    if (file.size) {
                        setState(x => ({ ...x, visible: true, imgUrl, file, fileList, execBeforUpload: { resolve, reject } }))
                    }
                })

            },
        };
    }, [children,state,setState]);


    const modalToggle = () => {
        setState(x => ({ ...x, visible: !x.visible }))
    }

    const onOk = () => {
        const {file} = state
        const imageElement = cropperRef?.current
        const cropper = imageElement?.cropper
        cropper.getCroppedCanvas({
            width: state.width,
            height: state.height
        }).toBlob(async blob => {
            // const file = new File([blob], filename, { uid: new Date().getTime() });
            const newFile = new File([blob], file.name, {type: file.type,uid: new Date().getTime()})
            setState(x => ({ ...x, visible: false, file:newFile }))
            state.execBeforUpload.resolve(newFile)
        })

    }




    return <>
        <Modal
            title={title || `当前裁剪图片尺寸大小为${width} x ${height} px`}
            cancelText="取消"
            okText="确定"
            onCancel={modalToggle}
            visible={visible}
            width={modalWidth || width * 2 + 100}
            onOk={onOk}
        >
            <div className="cropper-container-container">
                <div className="cropper-container-left">
                    <Cropper
                        style={{ height, width }}
                        src={imgUrl}
                        className="cropper"
                        ref={cropperRef}
                        // Cropper.js options
                        viewMode={1}
                        dragMode="move"
                        zoomable={true}
                        aspectRatio={width / height} // 固定为1:1  可以自己设置比例, 默认情况为自由比例
                        preview=".cropper-preview"
                        // crop={onCrop}
                    />
                </div>
                <div className="cropper-container-right">

                    <div className="cropper-preview" style={{ width: width, height: height }} />


                </div>
            </div>
        </Modal>
        {renderUpload()}
    </>
}
