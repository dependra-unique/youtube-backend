import { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";



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
    
    //get comment by comment id,,, database se because jisne comment kia hai usi user ko allow karege comment update karne ke lia
    const {commentId} = req.params;
    const comment = await Comment.findById(commentId)

    //user se content le lo comment update karne ke lia
    const {content} =  req.body

    if(content === ""){
        throw new ApiError(404, "content is required");
    }

    if(!comment){
        throw new ApiError(400, "comment id not found")
    }

    //check karo jo user comment kar raha hai vo owner hai ya nhi
    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(404, "Only owner can update the comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(200, updatedComment, "Comment update  successfully")
})

const deleteComment = asyncHandler( async (req, res) => {
    //TODO: delete comment 
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment not found")
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only owner can delete the comment")
    }

    await Comment.findByIdAndDelete(commentId)

    //comment ke andar jo like hai vo dalete karna hai
    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    })

    return res
    .status(200)
    .json(200, {commentId}, "comment successfully deleted")

})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}