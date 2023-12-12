const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sgmail = require('@sendgrid/mail');
const fs = require('fs');
const weekDB = require('../../models/user/stylistweeks.model.js');
const signDB = require('../../models/user/Signup.model.js');
const favDB = require('../../models/user/favorite.model.js');
const slotDB = require('../../models/user/stylistTimeSlots.models.js');
const bookappointDB = require('../../models/user/bookappointment.model.js');
const ordereDB = require('../../models/user/bookorder.model.js');
const userskillDB = require('../../models/user/userskill.model.js');
const verifyToken = require('../../middleware/authentication.js');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const IncomingForm = require('formidable');
const formidable = require('formidable');
const date = require('date-and-time');

const {
    successWithData,
    errorResponse,
    errorWithData,
    successData,
    validateData,
    notFound,
} = require('../../helpers/apiResponse.js')

module.exports = {
    verifyToken,

    //------------------------Api for book an Appointment----------------------------//
    bookappointment: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thuresday', 'Friday', 'Saturday'];
            const {
                stylist_id,
                service_id,
                skillname,
                fee,
                duration,
                bookingdate,
                bookingtime
            } = req.body;
            const bookingdateandtime = new Date();
            const day = bookingdateandtime.getDay();
            // console.log('day',day);
            var dayname = arr[parseInt(day)];
            // console.log('dayname',dayname);
            // const book = await userskillDB.findOne({_id:req.body.id});
            //console.log('bookappointment req.body', req.body);
            // if (dayname) {
            //     const find = await bookappointDB.findOne({
            //         stylist_id: req.body.stylist_id,
            //         appointmentstatus: 'pending'
            //     });
            //     if (find) {
            //         return successWithData(res, 'Stylist Found', find);
            //     } else {
            //         const remove = await bookappointDB.find();
            //         await Promise.all(remove.map(async (row) => {
            //             if (row.stylist_id != find.stylist_id) {

            //                 const update = await bookappointDB.deleteOne({
            //                     _id: row.id
            //                 });
            //             }
            //         }))
            //         console.log('success');
            //        // return successWithData(res, 'Data Successfully Deleted', remove);
            //    }
            const appoint = await bookappointDB.create({
                user_id: profile_id,
                stylist_id: stylist_id,
                service_id: service_id,
                skillname: skillname,
                fee: fee,
                day: dayname,
                duration: duration,
                appointmentstatus: '0', //pending
                bookingdateandtime: bookingdateandtime,
                bookingdate: bookingdate,
                bookingtime: bookingtime
            })
            appoint.status = 1;
            //  console.log('appoint',appoint);
            const doc = await appoint.save();
            if (doc) {
                console.log('doc', doc);
                return successWithData(res, 'Data Found', doc);
            }


            // }else if(!(find)){
            //     const update=await bookappointDB.deleteOne({})

            // }
            // } else {
            //     return errorResponse(res, 'error');
            // }
        } catch (err) {
            console.log(err);
        }
    },

    //------------------Api for  book the stylist-------------------------//
    bookorder: async function (req, res) {
        try {
            //console.log('bookordernow------------------------')
            var profile_id = req.user.id;
            //var _id = profile_id;
            // const {
            //     _id
            // } = req.body;
            const arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thuresday', 'Friday', 'Saturday'];

            const {
                stylist_id,
                service_id,
                skillname,
                fee,
                duration,
                address
                //bookingdate,
                //bookingtime
            } = req.body;
            const bookingdateandtime = new Date()
            // console.log('bookingdateandtime', bookingdateandtime);
            const day = bookingdateandtime.getDay();
            //console.log('day', day);
            var dayname = arr[parseInt(day)];
            // console.log('sdfgh', dayname)

            // const book = await userskillDB.findOne({_id:req.body.id});
            //console.log('bookappointment req.body', req.body);
            // if (book) {
            //var bookingtimes = '0000-01-01T' + bookingtime + ':00.000Z';
            // console.log('bookingtimes', bookingtimes);
            const appoint = await ordereDB.create({
                user_id: profile_id,
                stylist_id: stylist_id,
                service_id: service_id,
                skillname: skillname,
                fee: fee,
                duration: duration,
                appointmentstatus: '0',
                bookingdateandtime: bookingdateandtime,
                day: dayname,
                address: address
                // bookingdate: bookingdate,
                //bookingtime: bookingtimes
            })
            appoint.status = 1;
            var data = await appoint.save()
            // console.log('data', data);
            if (data) {
                //console.log('sdfghjk');

                const find = await bookappointDB.find({
                    user_id: profile_id,
                    appointmentstatus: '0'
                });
                //console.log('find', find);
                await Promise.all(find.map(async (row) => {
                    const update = await bookappointDB.findOneAndUpdate({
                        user_id: row.user_id,
                        appointmentstatus: '0' //pending in cart
                    }, {
                        order_id: data._id,
                        appointmentstatus: '1' //processing
                    }, {
                        new: true
                    })
                    //console.log('update', update);
                }))

                const update1 = await bookappointDB.find({
                    order_id: data._id
                }).select('bookingdateandtime');
                //console.log('update',update1);

                res.send({
                    code: 200,
                    success: true,
                    data: data,
                    update1: update1,
                    message: 'Data Found'
                })

            }
        } catch (err) {
            console.log(err);
        }
    },

    //------------------api for searching the nearby location----------------------------------//

    //------------------api for cancel booking with their cancel reason---------------------------//
    cancelbookingreason: async function (req, res) {
        try {
            var profile_id = req.user.id;
            console.log('asdfghj',profile_id);
            const arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thuresday', 'Friday', 'Saturday'];

            const {
                stylist_id,
                service_id,
                skillname,
                fee,
                duration,
                cancelreason,
                canceldescription
                //bookingdate,
                //bookingtime
            } = req.body;
            const bookingdateandtime = new Date()
            //console.log('bookingdateandtime', bookingdateandtime);
            const day = bookingdateandtime.getDay();
            //console.log('day', day);
            var dayname = arr[parseInt(day)];
            //console.log('sdfgh', dayname)

            // const book = await userskillDB.findOne({_id:req.body.id});
            //console.log('bookappointment req.body', req.body);
            // if (book) {
            //var bookingtimes = '0000-01-01T' + bookingtime + ':00.000Z';
            // console.log('bookingtimes', bookingtimes);
            const order = await ordereDB.create({
                user_id: profile_id,
                stylist_id: stylist_id,
                service_id: service_id,
                skillname: skillname,
                fee: fee,
                duration: duration,
                appointmentstatus: '2', //cancel
                bookingdateandtime: bookingdateandtime,
                day: dayname,
                canceldescription: canceldescription
                // bookingdate: bookingdate,
                //bookingtime: bookingtimes
            })
            order.status = 1;
            order.cancelreason = 'reason1';

            var data = await order.save()
            // console.log('data', data);
            if (data) {
                const find = await bookappointDB.find({
                    user_id: profile_id,
                    appointmentstatus: '0'
                });
                console.log('find', find);
                await Promise.all(find.map(async (row) => {
                    const update = await bookappointDB.updateOne({
                        user_id: row.user_id,
                        appointmentstatus: '0'
                    }, {
                        order_id: data._id,
                        appointmentstatus: '2',
                        cancelreason: cancelreason,
                        canceldescription: canceldescription,
                        canceltype: profile_id
                    }, {
                        new: true
                    })
                    console.log('update', update);
                }))
                res.send({
                    code: 200,
                    success: true,
                    data: data,
                    //update1: update1,
                    message: 'Data Found'
                })
            }
        } catch (err) {
            console.log(err);
        }
    },


    //---------------------Api for confirm or reject the order by stylist-----------------------// 
    updateorder: async function (req, res) {
        try {
            var profile_id = req.user.id;
            //console.log('profile_id',profile_id);
            var type = req.body.type;
            //console.log('type', type);
            if (type) {
                const confirm = await ordereDB.findOneAndUpdate({
                    _id: req.body.order_id
                }, {
                    appointmentstatus: type
                });
                //console.log('confirmmmm', confirm);
                if (confirm) {
                    const confirm1 = await bookappointDB.find({
                        order_id: req.body.order_id,
                        appointmentstatus: '1'
                    });
                    await Promise.all(confirm1.map(async (row) => {
                        const update = await bookappointDB.updateOne({
                            order_id: row.order_id,
                            appointmentstatus: '1'
                        }, {
                            appointmentstatus: type
                        }, {
                            new: true
                        })
                        //console.log('update', update);
                    }))

                    //if(confirm && confirm1){
                    // const find=await ordereDB.findOne({_id:confirm._id});
                    // if(find){
                    const find1 = await bookappointDB.find({
                        order_id: req.body.order_id
                    });
                    return res.send({
                        code: 200,
                        success: true,
                        data: confirm,
                        data1: find1,
                        message: 'Data Successfully Found'
                    })
                    // }
                    // }
                    // console.log('confirmmmm1',confirm1);
                }
            }
        } catch (err) {
            console.log(err);
        };
    },


    updatebooking: async function (req, res) {
        try {
            var profile_id = req.user.id;
            //console.log('profile_id',profile_id);
            var type = req.body.type;
            //console.log('type', type);
            if (type) {
                // const confirm = await ordereDB.findOneAndUpdate({
                //     _id: req.body.order_id
                // }, {
                //     appointmentstatus: type
                // });
                //console.log('confirmmmm', confirm);
                // if (confirm) {
                const confirm1 = await bookappointDB.find({
                    _id: req.body.id,
                    //appointmentstatus: '1'
                });
                await Promise.all(confirm1.map(async (row) => {
                    const update = await bookappointDB.updateOne({
                        _id: row.id,
                        // appointmentstatus: '1'
                    }, {
                        appointmentstatus: type
                    }, {
                        new: true
                    })
                    //console.log('update', update);
                }))

                //if(confirm && confirm1){
                // const find=await ordereDB.findOne({_id:confirm._id});
                // if(find){
                const find1 = await bookappointDB.find({
                    _id: req.body.id
                });
                return res.send({
                    code: 200,
                    success: true,
                    data: confirm1,
                    data1: find1,
                    message: 'Data Successfully Found'
                })
                // }
                // }
                // console.log('confirmmmm1',confirm1);
                //}
            }
        } catch (err) {
            console.log(err);
        }
    },

    //---------------------Api for get the booked order with user details--------------------------//
    getbookorder: async function (req, res) {
        try {
            var profile_id = req.user.id;
            // console.log('asdfghjj', profile_id);
            //const book =await ordereDB.find({stylist_id:profile_id});
            var data = await bookappointDB.aggregate([{
                    $match: {
                        appointmentstatus: '1', //processing
                        'user_id': ObjectId(profile_id)
                        //user_id: ObjectId(profile_id),

                    }
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'stylist_id',
                        foreignField: '_id',
                        as: 'stylistdetails',
                    }
                },

            ]);
            //console.log('data', data);
            return successWithData(res, 'Data Found', data);
        } catch (err) {
            console.log(err);
        }
    },


    //-------------------Api for get the stylist booked by user------------------------//
    getuserappointment: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const appoint = await bookappointDB.find({
                stylist_id: req.body.stylist_id,
                appointmentstatus: '0',
                user_id: profile_id
            });
            // console.log('appoint', appoint)
            if (appoint) {
                const profile = await signDB.findOne({
                    _id: req.body.stylist_id,
                });
                //console.log('profile', profile);
                if (profile) {
                    res.send({
                        code: 200,
                        success: true,
                        data: {
                            appoint: appoint,
                            profile_image: profile.profile_image,
                            background_image: profile.background_image,
                            profile_name: profile.firstname + " " + profile.lastname
                        },
                    })
                }
                // return successWithData(res, 'Data Found', appoint);
            } else {
                return errorResponse(res, 'Data Not Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //-----------------------Api for stylist to get the users who booked him------------------------//
    getstylistappointment: async function (req, res) {
        try {
            var stylist_id = req.user.id;
            //console.log('dfghj', stylist_id);
            var data = await bookappointDB.aggregate([{
                    $match: {
                        stylist_id: ObjectId(stylist_id)
                    }
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'userdetails',
                    }
                },
                {
                    $lookup: {
                        from: 'latlongs',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'locations',
                    }
                },
            ]);
            //console.log('data', data);
            return successWithData(res, 'Data Found', data);

        } catch (err) {
            console.log(err);
        }
    },

    getappointmentoffer: async function (req, res) {
        try {
            var stylist_id = req.user.id;
            // console.log('dfghj', stylist_id);
            const {
                type,
                date
            } = req.body;
            const newday = new Date(req.body.date);
            // bookingdateandtime: {
            //     $lte: date
            //   }

            var currentday = new Date(req.body.date).toISOString().split('T')[0] + 'T00:00:00.000Z';
            const makenextday = newday.setDate(newday.getDate() + 1);
            var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
            //console.log('newday----',newday);
            //console.log('nextday-',nextday);
            //console.log('currentday',currentday);
            if (type) {
                //console.log('date-----',date);
                const finder = await bookappointDB.find({
                    appointmentstatus: type, //Processing
                    // bookingdateandtime: {
                    //     $toDate: date
                    // }
                    bookingdateandtime: {
                        $gte: new Date(date), //'2023-03-31T00:00:00.000Z'
                        $lt: new Date(nextday)
                    }
                });
                if (finder) {
                    var data = await bookappointDB.aggregate([{
                            $match: {
                                appointmentstatus: type, //confirm
                                stylist_id: ObjectId(stylist_id),
                                bookingdateandtime: {
                                    $gte: new Date(date), //'2023-03-31T00:00:00.000Z'
                                    $lt: new Date(nextday)
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'signups',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'userdetails',
                            }
                        },
                        {
                            $lookup: {
                              from: 'stylistreviews',
                              localField: 'stylist_id',
                              foreignField: 'to',
                              as: 'reviews',
                            }
                          },
                          // {$sort:{"reviews":-1}},
                  
                          {
                            $addFields: {
                              reviewsCount: {
                                $size: "$reviews"
                              }
                            }
                          },
                    ])
                    //console.log('data',data);
                    res.send({
                        code: 200,
                        success: true,
                        data: data,
                        message: 'Data Successfully Found'
                    })
                    //const data=await bookappointDB.find({appointmentstatus:'Processing',finder.bookingdateandtime==date1})
                    //return successWithData(res, 'Data Found', finder);
                }

            }

        } catch (err) {
            console.log(err);
        }
    },

    //---------------------------------Api for update the appointment status to 'confirm'--------------------//
    updateappointment: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const update = await bookappointDB.findOne({
                _id: req.body.id
            });
            //console.log('updated', update);
            if (update) {
                //console.log('12345678');
                const appoint = await bookappointDB.updateOne({
                    _id: req.body.id
                }, {
                    appointmentstatus: '2', //cancel

                });
                if (appoint) {
                    //console.log('appoint', appoint);
                    return successWithData(res, 'Appointment Confirmed', appoint)
                } else {
                    return errorResponse(res, 'Error While confirm Appointment');
                }
            } else {
                return errorResponse(res, 'User Not found');
            }
        } catch (err) {
            console.log(err);
        }
    },


    //--------------------Api for update appointment date and time------------------------------//
    updateappointmenttime: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                bookingdateandtime
            } = req.body;
            //console.log('updateappointmenttime', req.body);
            const arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thuresday', 'Friday', 'Saturday'];

            const update = await bookappointDB.findOne({
                _id: req.body.booking_id
            });
            const newbookingtime = new Date(bookingdateandtime);
            const day = newbookingtime.getDay();
            // console.log('day',day);
            var dayname = arr[parseInt(day)];
            //console.log('dayname',dayname);
            //console.log('updated', update);
            if (update) {
                //console.log('12345678');
                const appoint = await bookappointDB.updateOne({
                    _id: req.body.booking_id
                }, {
                    bookingdateandtime: bookingdateandtime,
                    day: dayname

                });
                if (appoint) {
                    // console.log('appoint', appoint);
                    return successWithData(res, 'Appointment Confirmed', appoint)
                } else {
                    return errorResponse(res, 'Error While confirm Appointment');
                }
            } else {
                return errorResponse(res, 'User Not found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    //-------------Api for get the booking deatil by id----------------------//
    getbookingdetailbyid: async function (req, res) {
        try {
            var profile_id = req.user.id;
            if (profile_id) {
                const book = await userskillDB.findOne({
                    _id: req.body.id
                });
                if (book) {
                    const profile = await signDB.findOne({
                        _id: book.user_id,
                        type: 'stylist'
                    });
                    if (profile) {
                        res.send({
                            code: 200,
                            success: 'true',
                            data: {
                                book: book,
                                profile_image: profile.profile_image,
                                profile_name: profile.firstname + " " + profile.lastname
                            },
                            //profile:profile,
                            message: 'Data Found'
                        })
                    } else {
                        return errorResponse(res, 'Error Occured')
                    }
                } else {
                    return errorResponse(res, 'Error Occured');
                }
            }

        } catch (err) {
            console.log(err);
        }
    },

    //-------------------Api for delete the user appointment booked by user---------------------------//
    deleteappointment: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const data = await bookappointDB.findOne({
                _id: req.body.id
            });
            if (data) {
                const update = await bookappointDB.deleteOne({
                    _id: req.body.id
                });
                if (update) {
                    return successWithData(res, 'Appointment deleted', update);
                }
            } else {
                return errorResponse(res, 'Appointment Not found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //------------------Api for save the reason of cancel booking---------------------//
    // cancelbookingreason: async function (req, res) {
    //     try {
    //         var profile_id = req.user.id;
    //         if (profile_id) {
    //             const {
    //                 cancelreason,
    //                 canceldescription
    //             } = req.body;
    //             console.log('parameters', req.body);
    //             const cancel = await ordereDB.findOneAndUpdate({
    //                 _id: req.body.order_id,
    //                 appointmentstatus: 'cancel'
    //             }, {
    //                 cancelreason: cancelreason,
    //                 canceldescription: canceldescription,
    //                 canceltype: profile_id
    //             });
    //             if (cancel) {
    //                 const cancel1 = await bookappointDB.findOneAndUpdate({
    //                     order_id: cancel._id,
    //                     appointmentstatus: 'cancel'
    //                 }, {
    //                     cancelreason: cancelreason,
    //                     canceldescription: canceldescription,
    //                     canceltype: profile_id
    //                 });
    //             }

    //             //console.log('cancel', cancel);
    //             return successData(res, 'Sucessfully Updated');
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },

    //------------------------------Api for user to get the booking list----------------------------//
    getbookinglist: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const type = req.body.type;
            //var arr=[];
            //const update=await ordereDB.find({type:})
            if (type == 'previous') {
                var data = await bookappointDB.aggregate([{
                        $match: {
                            'user_id': ObjectId(profile_id),
                            appointmentstatus: '4'
                        }
                    },
                    {
                        $lookup: {
                            from: 'signups',
                            localField: 'stylist_id',
                            foreignField: '_id',
                            as: 'stylist',
                        }
                    },
                ])
                return successWithData(res, 'Data Found', data);

                //console.log('data',data);
                // return successWithData(res, 'Data Found', data);

            } else if (type == 'cancelled') {
                var data = await bookappointDB.aggregate([{
                        $match: {
                            'user_id': ObjectId(profile_id),
                            appointmentstatus: '2'
                        }
                    },
                    {
                        $lookup: {
                            from: 'signups',
                            localField: 'stylist_id',
                            foreignField: '_id',
                            as: 'stylist',
                        }
                    },
                ])
                return successWithData(res, 'Data Found', data);
            } else {
                return errorResponse(res, 'Data Not found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    //-----------------------------Api  for user to get the appointment status------------------------------------//
    getappointmentstatus: async function (req, res) {
        try {
            var profile_id = req.user.id;
            //console.log('_id', profile_id);
            var data = await bookappointDB.aggregate([{
                    $match: {
                        $and: [{
                            appointmentstatus: {
                                $ne: '4' //Completed
                            }
                        }, {
                            appointmentstatus: {
                                $ne: '0' //pending
                            }
                        }, {
                            appointmentstatus: {
                                $ne: '2' //confirm
                            }
                        }],
                        'user_id': ObjectId(profile_id)
                    },
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'stylist_id',
                        foreignField: '_id',
                        as: 'stylist',
                    }
                },
            ])
            //console.log('data', data);

            return successWithData(res, 'Data Found', data);
        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------------Api for user to get the confirm appointment--------------------------------//
    getconfirmappointment: async function (req, res) {
        try {
            var profile_id = req.user.id;
            console.log('profile_id', profile_id);
            var arr = [];
            // console.log('profile',profile_id);
            var data = await bookappointDB.aggregate([{
                    $match: {
                        'user_id': ObjectId(profile_id),
                        '_id': ObjectId(req.body._id),
                        //appointmentstatus:'processing'
                    }
                },
                {

                    $lookup: {
                        from: 'signups',
                        localField: 'stylist_id',
                        foreignField: '_id',
                        as: 'stylist',
                    }
                },
                {
                    $lookup: {
                        from: 'latlongs',
                        localField: 'stylist_id',
                        foreignField: 'user_id',
                        as: 'latlongs',
                    }
                },
                {
                    $lookup: {
                        from: 'stylistreviews',
                        localField: 'stylist_id',
                        foreignField: 'to',
                        as: 'reviews',
                    }
                },
                {
                    $addFields: {
                        reviewsCount: {
                            $size: "$reviews"
                        }
                    }
                }

            ])
            await Promise.all(data.map(async (row) => {
                const fav = await favDB.findOne({
                    user_id: profile_id,
                    stylist_id: row._id
                });
                if (fav) {
                    row.favstylist = fav.favstylist;
                } else {
                    row.favstylist = 0;
                }
                arr.push(row);
            }))
            return res.send({
                // status: '200',
                code: 200,
                success: true,
                data: arr,
                //stylist: stylists,

                message: 'Successfully found stylist',

            })
            //return successWithData(res, 'Confirmed Data Found', data);
        } catch (err) {
            console.log(err);
        }
    },

    //------------------------------------- Api for user to get the Complete appointment-------------------------------//
    getcompleteappointment: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var arr = [];
            var data = await bookappointDB.aggregate([{
                    $match: {
                        'user_id': ObjectId(profile_id),
                        '_id': ObjectId(req.body._id),
                        //appointmentstatus:'completed'
                    }
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'stylist_id',
                        foreignField: '_id',
                        as: 'stylist',
                    }
                },
                {
                    $lookup: {
                        from: 'latlongs',
                        localField: 'stylist_id',
                        foreignField: 'user_id',
                        as: 'latlongs',
                    }
                },
                {
                    $lookup: {
                        from: 'stylistreviews',
                        localField: 'stylist_id',
                        foreignField: 'to',
                        as: 'reviews',
                    }
                },
                {
                    $addFields: {
                        reviewsCount: {
                            $size: "$reviews"
                        }
                    }
                }

            ])

            await Promise.all(data.map(async (row) => {
                const fav = await favDB.findOne({
                    user_id: profile_id,
                    stylist_id: row._id
                });
                if (fav) {
                    row.favstylist = fav.favstylist;
                } else {
                    row.favstylist = 0;
                }
                arr.push(row);
            }))
            return res.send({
                // status: '200',
                code: 200,
                success: true,
                data: arr,
                //stylist: stylists,

                message: 'Successfully found stylist',

            })


            //return successWithData(res, 'Complete Booking Data Found', data);
            //const complete=await ordereDB.findOne({_id:req.body.order_id,user_id:profile_id,appointmentstatus:'completed'});
            // if(complete){
            //     return successWithData(res,'complete apoointment found',complete);
            // }else{
            //     return errorResponse(res,'Data not found');
            // }

        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------------Api for user to get the order by order_id--------------------------//
    editorder: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const order = await ordereDB.findOne({
                _id: req.body.order_id
            });
            if (order) {
                return successWithData(res, 'Order Found', order);
            } else {
                errorResponse(res, 'Order Not Found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    //----------------------------- Api for user to get the stylist detail by id-------------------------------------//
    getuserdeatilbyid: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const find = await signDB.findOne({
                _id: req.body.id
            });
            if (find) {
                return successWithData(res, 'Stylist Found', find);
            } else {
                return errorResponse(res, 'No Data Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //--------------------------Api for user to get the single booking detail by id----------------------------//
    getsinglebookingdetailbyid: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var data = await bookappointDB.aggregate([{
                    $match: {
                        'user_id': ObjectId(profile_id),
                        '_id': ObjectId(req.body.id),
                        //appointmentstatus:'completed'
                    }
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'stylist_id',
                        foreignField: '_id',
                        as: 'stylist',
                    }
                },
            ])
            // const profile=await bookappointDB.findOne({_id:req.body.id});
            // if(profile){
            return successWithData(res, 'Data Found', data);
            // }

        } catch (err) {
            console.log(err);
        }
    }

}