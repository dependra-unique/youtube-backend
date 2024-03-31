import asyncHandler from "../utils/asyncHandler";



const getVideoComments = asyncHandler( async (req, res) => {
    //TODO: get comments of a video
})

const addComment = asyncHandler( async (req, res) => {
    //TODO: add comment on video
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