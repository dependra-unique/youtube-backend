import { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";



const getVideoComments = asyncHandler( async (req, res) => {
    //TODO: get comments of a video
})

const addComment = asyncHandler( async (req, res) => {
    //TODO: add comment on video

    //take content from user
    const {content} = req.body
    
    //jis video par comment karna hai us video ko nikalo => video ko nikaalne ke lia user se video id lelo url par click karwake
    try {
        const {videoId} = req.params
    
        console.log(videoId);
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid videoId...")
        }
    
        const video = await Video.findById(videoId)
    
        if(!video){
            throw new ApiError(501, "Video not found")
        }
    
        if(content === ""){
            throw new ApiError(400, "Content is required")
        }
        //create comment
        const comment = await Comment.create({
            content,
            video: video?._id,
            owner: req.user?._id
        })
    
        if(!comment){
            throw new ApiError(400, "Comment not created...")
        }
    } catch (error) {
        console.log("Error in adding comment: ", error);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment add successfully")
    )
    


})

const updateComment = asyncHandler( async (req, res) => {
    //TODO: update comment on video
})

const deleteComment = asyncHandler( async (req, res) => {
    //TODO: delete comment 
})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}