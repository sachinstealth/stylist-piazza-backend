const express = require('express');
const signDB = require('../../models/user/Signup.model.js')
const serviceDB = require('../../models/user/service.model.js')
const verifyToken = require('../../middleware/authentication.js');
const favDB = require('../../models/user/favorite.model.js');
const latlongDB = require('../../models/user/latlong.model.js');
const addressDB = require('../../models/user/useraddress.model.js');
const img = require('../../config/db.js')
const stylistreviewDB = require('../../models/user/stylistreviews.model.js');
const userreviewDB = require('../../models/user/userreview.model.js');
const reviewimageDB = require('../../models/user/reviewimages.model.js');
const stylistavailabilityDB = require('../../models/user/stylistavailability.model.js');
const stylistgalleryDB = require('../../models/user/stylistgallery.model.js');
//const IncomingForm = require('formidable');
//const formidable = require('formidable');
var base64ToImage = require('base64-to-image');
const {
  generateotps
} = require('../../services/otp.js')
const {
  successWithData,
  errorResponse,
  errorWithData,
  successData,
  validateData,
  notFound,
} = require('../../helpers/apiResponse.js')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sgmail = require('@sendgrid/mail');
const fs = require('fs');
const weekDB = require('../../models/user/stylistweeks.model.js');
const slotDB = require('../../models/user/stylistTimeSlots.models.js');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const IncomingForm = require('formidable');
const formidable = require('formidable');
const {
  where
} = require('../../models/user/Signup.model.js');
const {
  emitKeypressEvents
} = require('readline');

const asyncParse = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true
    });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      // resolve "returns" the promise so you will have a straighforward logic flow
      resolve({
        fields,
        files
      });
    });
  });

module.exports = {
  verifyToken,

  //--------------------Api for save the weekday--------------------//
  timeAvailability: async function (req, res) {
    try {
      const {
        weekdays
      } = req.body;
      var stylist = new stylistavailabilityDB();
      stylist.weekdays = weekdays;
      stylist.status = 1;
      weekDB.find((err, doc) => {
        if (err) {
          return errorWithData(res, 'Weekdays Not entered');
        } else {
          return successWithData(res, 'Weekdays Found Successfully', doc);
        }
      })
    } catch (err) {
      console.log(err);
    }
  },

  //------------------Api for selecting the different availability options------------------------------// 
  updatetimeavailability: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const {
        type
      } = req.body;
      console.log('type', req.body);
      //console.log('type',req.query);
      if (type) {
        if (type == 'AlwaysOpen') {
          const updated = await signDB.updateOne({
            _id: profile_id
          }, {
            timeAvailable: 1
          })
          return successWithData(res, 'Time Updated', updated);
        } else if (type == 'StandardHours') {
          const updated1 = await signDB.updateOne({
            _id: profile_id
          }, {
            timeAvailable: 2
          });
          const time = await stylistavailabilityDB.findOne({
            user_id: profile_id
          });
          console.log('time', time)
          if (time == null) {
            console.log('iff');
            const hours = await weekDB.find().sort({
              _id: 1
            });
            await Promise.all(hours.map(async (row) => {
              console.log('row', row);

              const weeks = new stylistavailabilityDB();
              weeks.week_id = row._id,
                weeks.user_id = profile_id,
                weeks.from = '0000-01-01T09:00:00.000Z',
                weeks.weekday = row.weekdays,
                weeks.to = '0000-01-01T17:00:00.000Z',
                weeks.status = 1
              var doc = await weeks.save();
              if (doc) {
                console.log('weeks', weeks);
                return successData(res, 'Time Updated');

              } else {
                return errorResponse(res, 'Error Found');
              }
            }));
          } else {
            console.log('else');
            return successData(res, 'Time Updated')
          }

        } else {
          const updated3 = await signDB.updateOne({
            _id: profile_id
          }, {
            timeAvailable: 0
          })
          return successWithData(res, 'Time Updated', updated3);
        }
      }

    } catch (err) {
      console.log(err);
    }

  },

  //-------------------Api for get the time availability------------------------//
  gettimeavailability: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const updated2 = await signDB.findOne({
        _id: profile_id
      }).select("timeAvailable");
      return successWithData(res, 'Time Updated', updated2);
    } catch (err) {
      console.log(err);
    }

  },

  //-----------------------------Api for user to add the Updated time--------------------------------// 
  addtimeavailability: async function (req, res) {
    try {
      const profile_id = req.user.id;
      var _id = profile_id;
      const {
        weekday_id,
        from,
        to,
        removetimeSlot
      } = req.body;
      //console.log('acx', req.body)
      const weekdays = await weekDB.findOne({
        _id: req.body.weekday_id
      });
      console.log('weekdays', weekdays);
      //09:00 add this format
      var fromtime = '0000-01-01T' + from + ':00.000Z';
      var totime = '0000-01-01T' + to + ':00.000Z';
      //console.log('fromtime',fromtime);
      //console.log('totime',totime);

      var stylisttime = await stylistavailabilityDB.find({
        user_id: profile_id,
        week_id: weekday_id,

        to: {
          $lte: fromtime
        }
      });
      console.log('stylisttime', stylisttime);
      if (stylisttime.length > 0) {
        // console.log('if');
        const slots = new stylistavailabilityDB();
        slots.user_id = profile_id;
        slots.week_id = weekday_id;
        slots.weekday = weekdays.weekdays;
        slots.from = fromtime;
        slots.to = totime;
        slots.status = 1;
        slots.save((err, doc) => {
          if (err) {
            return errorWithData(res, 'Error');
          } else {
            return successWithData(res, 'Time save successfully', doc);
          }
        })
      } else {
        //console.log('elseif');
        return errorWithData(res, 'Time already added');
      }
    } catch (err) {
      console.log(err);
    }
  },

  //------------------------Api for user to get the available hours-----------------------------//
  getavailablehours: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var idss = ObjectId(profile_id);
      var arr = []
      // console.log('time-------------', idss);
      var data = await weekDB.aggregate([{
          $sort: {
            _id: 1
          }
        },
        {
          $lookup: {
            from: "stylistavailabilitys",
            let: {
              id: "$_id",
            },
            pipeline: [{
              $match: {
                $expr: {
                  $and: [{
                      $eq: [
                        "$user_id",
                        idss
                      ]
                    },
                    {
                      $eq: [
                        "$$id",
                        "$week_id"
                      ]
                    }
                  ]
                }
              }
            }],
            as: "timesavailable"
          }
        },
        {
          $project: {
            weekdays: 1,
            timesavailable: 1,
          }
        }
      ])
      // console.log('week', data);
      await Promise.all(data.map(async (row) => {
        await Promise.all(row.timesavailable.map(async (row1) => {
          //-----get from para date a
          var hours = row1.from.getHours();
          var minutes = row1.from.getMinutes();
          // console.log('row.timesavailable[0].from.getHours()', row1.from.getHours())
          //console.log('row.timesavailable[0].to.getHours()', row1.to.getHours())
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          minutes = minutes < 10 ? '0' + minutes : minutes;
          var strTime = hours + ':' + minutes + ' ' + ampm;
          //----------get to para date 
          var hours = row1.to.getHours();
          var minutes = row1.to.getMinutes();
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          minutes = minutes < 10 ? '0' + minutes : minutes;
          var strTime1 = hours + ':' + minutes + ' ' + ampm;
          row1.from = strTime;
          row1.to = strTime1;
        }))
        arr.push(row);
      }))
      //console.log('arrrslot time',arr)
      return successWithData(res, 'Data Found', arr);
    } catch (err) {
      console.log(err);
    }
  },

  //--------------------Api for stylist to update available hours--------------------------//
  updateavailablehours: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const {
        to,
        from
      } = req.body;
      var data = await stylistavailabilityDB.aggregate([{
        $match: {
          _id: ObjectId(req.body.id)
        }
      }])
      var fromtime = '0000-01-01T' + from + ':00.000Z';
      var totime = '0000-01-01T' + to + ':00.000Z';
      console.log('data', data);
      // const hours = await stylistavailabilityDB.findOne({
      //   _id: req.body.id
      // });
      //console.log('hours',hours);
      //console.log('to',parseInt('to'));
      //console.log('from',hours.from);
      //console.log('data', data);
      if (data) {
        const update = await stylistavailabilityDB.updateOne({
          _id: req.body.id
        }, {
          to: totime,
          from: fromtime
        });
        console.log('update', update);
        if (update) {
          return successWithData(res, 'Data Updated', update);
        } else {
          return errorResponse(res, 'Error found');
        }
      } else {
        return successData(res, 'Time Already Updated');
      }

    } catch (err) {
      console.log(err);
    }
  },

  //-------------------Api to get all the stylist list--------------------------------//
  getAllStylist: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var idss = ObjectId(profile_id);
      var arr = [];
      var data = await signDB.aggregate([{
          $match: {
            // categoryid:req.body.categoryid,
            type: 'stylist',
            status: '1',
          }
        },
        // {
        //   $lookup: {
        //     from: 'signups',
        //     localField: '_id',
        //     foreignField: '_id',
        //     as: 'stylistdetails',
        //   }
        // },
        {
          $lookup: {
            from: 'userskills',
            localField: '_id',
            foreignField: 'user_id',
            as: 'skillname',
          }
        },
        // {$sort:{"skills":-1}},
        {
          $lookup: {
            from: 'latlongs',
            localField: '_id',
            foreignField: 'user_id',
            as: 'location',
          }
        },
        //{$sort:{"location":-1}},

        {
          $lookup: {
            from: 'stylistreviews',
            localField: '_id',
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

        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
        // {$sort:{"stylistimages":-1}},

      ]).sort({
        data: -1
      });
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



        //arr.sort({_id:1});
      }))
      arr.sort((a, b) => {
        if (a._id < b._id) {
          return -1;
        }
      });
      return res.send({
        // status: '200',
        code: 200,
        success: true,
        data: arr,
        //stylist: stylists,

        message: 'Successfully found stylist',

      })
    } catch (err) {
      console.log(err);
    }
  },


  //----------------Api for get the stylist by stylist_id---------------------//
  getStylistById: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var _id = profile_id;
      //console.log('stylist_id', _id);
      //const {stylist}=req.body;
      //var idss = ObjectId(profile_id);
      const {
        stylist_id
      } = req.body
      var arr = [];
      //console.log('stylist', req.body);

      const stylists = await signDB.findOne({
        _id: stylist_id
      });
      //console.log('stylist', stylists);
      //var arr = [];
      // console.log('fav',fav);
      // if(fav){
      //   fav.status=1;
      //return successWithData(res,'Status',fav.status)
      var data = await signDB.aggregate([{
          $match: {
            _id: ObjectId(stylist_id)
          }
        },
        {
          $lookup: {
            from: 'userskills',
            localField: '_id',
            foreignField: 'user_id',
            as: 'skills',
          }

        },
        {
          $lookup: {
            from: 'latlongs',
            localField: '_id',
            foreignField: 'user_id',
            as: 'locations',
          }
        },
        {
          $lookup: {
            from: 'stylistreviews',
            localField: '_id',
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
        },

        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
        {
          $lookup: {
            from: 'stylistavailabilitys',
            localField: '_id',
            foreignField: 'user_id',
            as: 'stylistavailabilitys',
          }
        },
        // {
        //   $lookup: {
        //     from: 'bookappointments',
        //     localField: '_id',
        //     foreignField: 'stylist_id',
        //     as: 'bookappointments',
        //   }
        // },
      ])
      await Promise.all(data.map(async (row) => {
        const fav = await favDB.findOne({
          user_id: profile_id,
          stylist_id: row._id
        });
        console.log('fav-------', fav);
        if (fav) {
          row.favstylist = fav.favstylist;
        } else {
          row.favstylist = 0;
        }
        arr.push(row);
      }))

      //console.log('data',data);
      return res.send({
        code: 200,
        success: true,
        data: data,
        favstylist: arr,
        message: 'Successfully found stylist',

      })
    } catch (err) {
      console.log(err);
    }
  },

  //-------------------Api for recommended stylist----------------------------//
  recommendedstylist: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const find = await stylistreviewDB.find();
      if (find) {
        return successWithData(res, 'Recommeneded Stylist Found', find);
      } else {
        return errorResponse(res, 'Data Not Found');
      }
    } catch (err) {
      console.log(err);
    }
  },

  //---------------------------Api for user to search the particular stylist------------------------------//
  searchstylist: async (req, res) => {
    try {
      const profile_id = req.user.id;
      const {
        limit,
        skip
      } = req.body
      var arr = [];
      // arr1=[];
      // console.log('search', req.body);
      // const later=limit(limit*1).skip(page-1)*limit;

      //var demo = await signDB.find().limit(limit * 1).skip((page - 1) * limit)
      // var demos = await signDB.find({
      //   firstname: {
      //     '$regex': req.body.firstname,
      //     $options: 'i'
      //   },
      //   type: "stylist"
      // });
      //  console.log('demo', demos)
      // if (demos) {
      //   return successWithData(res, 'Matched Data', demos)
      // }
      var data = await signDB.aggregate([{
          $match: {
            //_id: ObjectId(stylist_id)
            firstname: {
              '$regex': req.body.firstname,
              $options: 'i'
            },
            type: "stylist"
            //'_id':ObjectId(demos._id)
          }
        },
        {
          $lookup: {
            from: 'signups',
            localField: '_id',
            foreignField: '_id',
            as: 'stylistdetails',
          }

        },
        {
          $lookup: {
            from: 'userskills',
            localField: '_id',
            foreignField: 'user_id',
            as: 'skillname',
          }

        },
        {
          $lookup: {
            from: 'latlongs',
            localField: '_id',
            foreignField: 'user_id',
            as: 'location',
          }
        },
        {
          $lookup: {
            from: 'stylistreviews',
            localField: '_id',
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
        },

        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
        // {
        //   $lookup: {
        //     from: 'bookappointments',
        //     localField: '_id',
        //     foreignField: 'stylist_id',
        //     as: 'bookappointments',
        //   }
        // },
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
      }));

      return res.send({
        code: 200,
        success: true,
        data: data,
        //stylistreview: arr1,
        favstylist: arr,
        message: 'Successfully found stylist',

      })

    } catch (err) {
      console.log(err);
    }
  },

  //------------------------Api for user to choose the favourite stylist----------------------------//
  // favstylist1: async function (req, res) {
  //   try {
  //     var profile_id = req.user.id;
  //     //var _id=profile_id;
  //     // const favlist=await signDB.findOne({_id});
  //     // console.log('favlist',favlist);

  //     const {
  //       stylist_id
  //     } = req.body;
  //     if (stylist_id == '') {
  //       return errorWithData(res, 'please enter stylist_id ');

  //     }
  //     var stylist = new favDB();
  //     stylist.user_id = profile_id;
  //     stylist.status = 1;
  //     stylist.favstylist=0;
  //     stylist.stylist_id = req.body.stylist_id;


  //     await stylist.save((err, doc) => {
  //       if (err) {
  //         return errorWithData(res, 'Error Found');
  //       } else {
  //         return successWithData(res, 'Data Found', doc);
  //       }
  //     })
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },

  favstylist: async function (req, res) {
    try {
      var profile_id = req.user.id;
      console.log('profile_id', profile_id);

      const favstylist = req.body.favstylist;
      const fav = await favDB.findOne({
        stylist_id: req.body.stylist_id,
        user_id: profile_id
      });
      if (!fav) {
        var stylist = new favDB();
        stylist.user_id = profile_id;
        stylist.status = 1;
        stylist.favstylist = 1;
        stylist.stylist_id = req.body.stylist_id;
        await stylist.save((err, doc) => {
          if (err) {
            return errorWithData(res, 'Error Found');
          } else {

            res.send({
              code: 200,
              success: true,
              data: doc
            })

            //return successWithData(res, 'Data Found', doc);
          }
        })
      }
      console.log('fav', fav);
      if (fav) {
        if (fav.favstylist == 1) {
          var favsttus = 0;
        } else {
          var favsttus = 1;

        }
        const update = await favDB.updateOne({
          stylist_id: ObjectId(req.body.stylist_id),
          user_id: profile_id
        }, {
          favstylist: parseInt(favsttus)
        });

        //return successWithData(res,'Data Successfully Updated',update);
        res.send({
          code: 200,
          success: true,
          data: favsttus
        })
      }
      //else{

      //     const update1=await favDB.updateOne({stylist_id:req.body.stylist_id,user_id:profile_id},{favstylist:favstylist});
      //     return successWithData(res,'Data Successfully Updated',update1);

      // }

    } catch (err) {
      console.log(err);
    }
  },

  //-------------------------Api for user to get the fav stylist list---------------------//
  getfavstylist: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var data = await favDB.aggregate([{
          $match: {
            'user_id': ObjectId(profile_id),
            favstylist: 1
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


      //console.log('data',data);
      return successWithData(res, 'Favstylist Found', data);
    } catch (err) {
      console.log(err);
    }
  },

  //----------    --------------------------Api for stylist to add their location----------------------------//
  addlocation: async function (req, res) {
    try {
      const profile_id = req.user.id;
      //var _id = profile_id;
      const {
        lat,
        long
      } = req.body;
      const addressed = await latlongDB.findOne({
        user_id: profile_id
      });
      //console.log('addressed', addressed)
      if (addressed) {
        const find1 = await latlongDB.findOne({
          user_id: profile_id
        });
        if (find1) {
          console.log('asdfghjk');
          const find2 = await latlongDB.updateOne({
            user_id: profile_id
          }, {
            lat: lat,
            long: long
          });
          return successWithData(res, 'Loaction Updated Successfully', find2);
        }
      } else {
        const {
          lat,
          long
        } = req.body;
        const address = await latlongDB.create({
          user_id: profile_id,
          lat: lat,
          long: long,
          // type: user_id.type

        })
        address.status = 1
        // console.log('abc=====', address);
        await address.save((err, doc) => {
          //console.log('doc',doc);
          if (err) {
            return errorWithData(res, 'Error')
          } else {
            return successWithData(res, 'address Saved', doc);
          }
        })
      }
    } catch (err) {
      console.log(err);
    }
  },

  // addlocation: async function (req, res) {
  //   try {
  //     const profile_id = req.user.id;
  //     //var _id = profile_id;
  //     const {
  //       lat,
  //       long
  //     } = req.body;
  //     const addressed = await latlongDB.findOne({
  //       user_id: profile_id
  //     });
  //     //console.log('addressed', addressed)
  //     if (addressed) {
  //       const find1 = await latlongDB.findOne({
  //         user_id: profile_id
  //       });
  //       if (find1) {
  //         console.log('asdfghjk');
  //         const find2 = await latlongDB.updateOne({
  //           user_id: profile_id
  //         }, {
  //           lat: lat,
  //           long: long
  //         });
  //         return successWithData(res, 'Loaction Updated Successfully', find2);
  //       }
  //     } else {
  //       const {
  //         lat,
  //         long
  //       } = req.body;
  //       const address = await latlongDB.create({
  //         user_id: profile_id,
  //         // lat: lat,
  //         // long: long,
  //         location: {
  //           type: 'Point',
  //           coordinates: [lat, long]
  //         },
  //         type: profile_id.type

  //       })
  //       address.status = 1
  //       // console.log('abc=====', address);
  //       await address.save((err, doc) => {
  //         //console.log('doc',doc);
  //         if (err) {
  //           return errorWithData(res, 'Error')
  //         } else {
  //           return successWithData(res, 'address Saved', doc);
  //         }
  //       })
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },

  updatelocation: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const {
        lat,
        long
      } = req.body;
      const find1 = await latlongDB.findOne({
        user_id: profile_id
      });
      if (find1) {
        console.log('asdfghjk');
        const find2 = await latlongDB.updateOne({
          user_id: profile_id
        }, {
          lat: lat,
          long: long
        });

        if (find2) {
          return successWithData(res, 'Loaction Updated Successfully', find2);
        }
      } else {
        return errorResponse(res, 'Location Not Found');
      }

    } catch (err) {
      console.log(err);
    }

  },

  //-------------------------Api for users to get all stylist location----------------------------------//
  getalladdress: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const address = await latlongDB.find();
      if (address) {
        return successWithData(res, 'Address Found', address)
      } else {
        return errorResponse(res, 'Error Found');
      }

    } catch (err) {
      console.log(err);
    }
  },

  //------------------------------Api for user to give the reviews to stylist----------------------------------//
  addstylistreviews: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var {
        stylist_id,
        // service_id,
        rating,
        message,
        image
      } = req.body;
      console.log('reviews', req.body);
      //const image = req.file;
      //var result = await asyncParse(req);
      var reviews = await new stylistreviewDB();
      reviews.from = profile_id,
        reviews.to = stylist_id,
        reviews.rating = rating,
        reviews.message = message,
        reviews.status = 1

      var doc = await reviews.save(reviews);

      console.log('styleimage', reviews);
      await Promise.all(image.map(async (row) => {
        var base64Str = row.value;
        //console.log('imageInresult.fieldsfo', base64Str)
        var file_name1 = Date.now();
        const uploadDir = '/var/www/html/nodeAPI/uploads/';
        var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);

        // console.log('styleimageInfo', imageInfo.fileName)
        var images = new reviewimageDB({
          review_id: reviews._id,
          image: imageInfo.fileName,
          status: 1
        });
        // images.review_id = reviews._id;
        // images.image = imageInfo.fileName;
        // images.status = 1;
        await images.save(images);
      }));
      return successWithData(res, 'Successfully found', doc);
      //  }
    } catch (err) {
      console.log(err);
    }
  },


  //----------------------Api for user to get the review images------------------------------//
  // getgallery: async function (req, res) {
  //   try {
  //     var profile_id = req.user.id;
  //     var data = await stylistreviewDB.aggregate([{
  //         $match: {
  //           'stylist_id': ObjectId(req.body.stylist_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'signups',
  //           localField: 'stylist_id',
  //           foreignField: '_id',
  //           as: 'stylist',
  //         }
  //       },
  //       {
  //         $unwind:'$stylist'
  //       },

  //       {
  //         $lookup: {
  //           from: 'reviewimages',
  //           localField: '_id',
  //           foreignField: 'review_id',
  //           as: 'stylistimages',
  //         }
  //       },
  //     {
  //       $unwind:'$stylistimages'
  //     },
  //       {
  //         $project: {
  //           'stylistimages.image': 1

  //         }
  //       },
  //     ])
  //     //console.log('data',data);
  //     return successWithData(res, 'Favstylist Found', data);
  //  } catch (err) {
  //     console.log(err);
  //   }
  // },

  getstylistgallery: async function (req, res) {
    try {
      var stylist_id = req.user.id;
      const find = await stylistgalleryDB.find({
        stylist_id: stylist_id
      });
      if (find) {
        return successWithData(res, 'Gallery Found', find);
      } else {
        return errorResponse(res, ' Gallery Not Found');
      }

    } catch (err) {
      console.log(err);
    }
  },

  //-------------------Api for user to get the stylist availability details------------//
  getstylistdetails: async function (req, res) {
    try {
      //var profile_id = req.user.id;
      var profile_id = req.user.id;
      var data = await signDB.aggregate([{
          $match: {
            '_id': ObjectId(req.body.stylist_id)
          }
        },
        {
          $lookup: {
            from: 'stylistavailabilitys',
            localField: '_id',
            foreignField: 'user_id',
            as: 'timeavailable',
          }
        },
      ])
      //console.log('data', data)
      const result = Array.from(new Set(data[0].timeavailable.map(s => s.weekday)))
        .map(lab => {
          var data1 = {
            weekday: lab,
            from: data[0].timeavailable.filter(s => s.weekday === lab).map(edition => edition.from),
            to: data[0].timeavailable.filter(s => s.weekday === lab).map(edition => edition.to)
          }
          return successWithData(res, 'Stylist Found', data1);
        })
      // await Promise.all(data[0].timeavailable.map(async (row) => {
      //        //console.log('log',data);
      // await Promise.all(data[0].timeavailable.map(async (row) => {
     //   }))
      // }))

    } catch (err) {
      console.log(err);
    }

  },

  //-------------------------Api for stylist to delete the particular review------------------///
  deletestylistreview: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const find = await stylistreviewDB.find({
        to: profile_id,
        from: req.user.id
      });
      if (find) {
        const find1 = await stylistreviewDB.deleteOne({
          to: profile_id,
          from: req.user.id
        });
        return successWithData(res, 'Successfully Deleted Review', find1);
      } else {
        return errorResponse(res, 'Reviews Not Found');
      }

    } catch (err) {
      console.log(err);
    }

  },

  //---------------------Api for stylist to giving the review to user stylist-----------------------//
  adduserreviews: async function (req, res) {
    try {
      var stylist_id = req.user.id;
      const {
        user_id,
        rating,
        message,
        image
      } = req.body;
      //console.log('reviews',req.body.image);
      //const image = req.file;
      //var result = await asyncParse(req);
      const reviews = new userreviewDB();
      reviews.to = user_id,
        reviews.from = stylist_id,
        reviews.rating = rating,
        //reviews.service_id = service_id,
        reviews.message = message,
        reviews.status = 1

      var doc = await reviews.save();
      //console.log('imagerrrrr',image.length);
      //console.log('image',reviews);
      await Promise.all(image.map(async (row) => {
        var base64Str = row.value;
        //console.log('imageInresult.fieldsfo', result.fields)
        var file_name1 = Date.now();
        const uploadDir = '/var/www/html/nodeAPI/uploads/';
        var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);

        //console.log('imageInfo', imageInfo)
        var images = new reviewimageDB({
          review_id: reviews._id,
          image: imageInfo.fileName,
          status: 1
        });
        // images.review_id = reviews._id;
        // images.image = imageInfo.filename;
        // images.status = 1;
        await images.save(images);
      }));

      return successWithData(res, 'Successfully found', doc);
      //  }
    } catch (err) {
      console.log(err);
    }
  },

  //--------------------------Api for user to get the reviews from the particular stylist-------------------------//
  getstylistreview: async function (req, res) {
    try {
      const profile_id = req.user.id;
      //const _id=req.body;
      //  const review=await stylistreviewDB.findOne({stylist_id:req.body.stylist_id,user_id:profile_id});
      //  if(review){
      // var data = await stylistreviewDB.aggregate([{
      //     $match: {
      //       stylist_id: req.body.stylist_id,
      //       user_id: profile_id
      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: 'reviewimages',
      //       localField: '_id',
      //       foreignField: 'review_id',
      //       as: 'reviewimages',
      //     }
      //   },
      // ])
      //console.log('data', data);
      // const data=await stylistreviewDB.findOne({stylist_id: req.body.stylist_id,user_id:profile_id});
      // console.log('data',data);
      // if(data){
      //   return successWithData(res,'Data Found',data);
      // }else{
      //   return errorResponse(res,'Data Not found');
      // }
      //       user_id: profile_id})
      //return successWithData(res, 'Data Found', data);
      //  }else{
      //   return errorResponse(res,'Error Found');
      //  }
      var data = await stylistreviewDB.aggregate([{
          $match: {
            'to': ObjectId(req.body.stylist_id)
          }
        },
        {
          $lookup: {
            from: 'signups',
            localField: 'to',
            foreignField: '_id',
            as: 'stylist',
          }
        },
        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },

      ])
      //console.log('data', data.length);
      return successWithData(res, 'Favstylist Found', data);

    } catch (err) {
      console.log(err);
    }
  },

  //--------------------------Api for stylist to get the reviews of particular user---------------------------//
  getuserreview: async function (req, res) {
    try {
      const stylist_id = req.user.id;
      //const {sty_id}=req.body;
      // if (review) {
      var data = await userreviewDB.aggregate([{
          $match: {
            to: req.body.user_id,
            from: stylist_id
          }
        }, {
          $lookup: {
            from: 'signups',
            localField: 'to',
            foreignField: '_id',
            as: 'stylist',
          }
        },
        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
      ])
      return successWithData(res, 'Data Found', data);
      // } else {
      //   return errorResponse(res, 'Error Found');
      // }
    } catch (err) {
      console.log(err);
    }
  },


  //------------Api for refer and earn points---------------------------//
  referandearn: async function (req, res) {
    try {
      var profile_id = req.user.id;
      //const referral = req.body.referral;
      const random = await signDB.findOne({
        _id: profile_id
      });
      // console.log('dfghjk',random);
      const update = await signDB.find({
        referral_code: random.usertoken
      })
      return successWithData(res, 'Referral code updated', update);
      // } else {
      //   return errorResponse(res, 'Invalid code');
      // }
    } catch (err) {
      console.log(err);
    }
  },

  //--------------Api for user/stylist to save the multiplle address------------------//
  saveuseraddress: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const {
        address,
        lat,
        long,
        type
      } = req.body;
      const user = await signDB.findOne({
        _id: profile_id
      });
      if (user) {
        const sign = new addressDB();
        sign.user_id = profile_id;
        sign.address = address;
        sign.lat = lat;
        sign.long = long;
        sign.type = type;
        sign.status = 1;

        var doc = await sign.save();
        if (doc) {
          return successWithData(res, 'Address Added successfully', doc);
        } else {
          return errorResponse(res, 'Address Not Found');
        }
      }
    } catch (err) {
      console.log(err);
    }
  },

  //-------------Api for user/stylist to get the multiple adddress------------------//
  getuseraddress: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const find = await addressDB.find({
        user_id: profile_id
      });
      if (find) {
        return successWithData(res, 'Address Found', find);
      } else {
        return errorResponse(res, 'Address Not Found');
      }

    } catch (err) {
      console.log(err);
    }

  },

  //-------------------Api for user/stylist to update their addresses-------------------//
  updateuseraddress: async function (req, res) {
    try {
      var profile_id = req.user.id;
      const {
        address,
        lat,
        long,
        type
      } = req.body;
      const user = await signDB.findOne({
        user_id: profile_id
      });
      if (user) {
        const update = await signDB.updateOne({
          user_id: profile_id
        }, {
          address: address,
          lat: lat,
          long: long,
          type: type
        });
        if (update) {
          return successWithData(res, 'Data Updated Successfully', update);
        } else {
          return errorResponse(res, 'Data Not Found');
        }
      }

    } catch (err) {
      console.log(err);
    }
  },

  //----------------Api for user to get the review given to stylist by user----------------//
  getgivenreview: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var data = await stylistreviewDB.aggregate([{
          $match: {
            'from': ObjectId(profile_id)
          }
        },
        {
          $lookup: {
            from: 'signups',
            localField: 'to',
            foreignField: '_id',
            as: 'stylist',
          }
        },

        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
      ])
      console.log('data', data.length);
      return successWithData(res, 'Reviews Found', data);
    } catch (err) {
      console.log(err);
    }
  },


  //------------Api for user to get the reviews given by  stylist-------------//
  getrecievedreview: async function (req, res) {
    try {
      var profile_id = req.user.id;
      var data = await userreviewDB.aggregate([{
          $match: {
            'to': ObjectId(profile_id)
          }
        },
        {
          $lookup: {
            from: 'signups',
            localField: 'from',
            foreignField: '_id',
            as: 'stylist',
          }
        },
        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
      ])
      //console.log('data',data.length);
      return successWithData(res, 'Reviews Data Found', data);
    } catch (err) {
      console.log(err);
    }
  },

  //------------------Api for stylist to get the reviews given by user--------------//
  getstylistrecievereview: async function (req, res) {
    try {
      var stylist_id = req.user.id;
      console.log('stylistid', stylist_id);
      var data = await stylistreviewDB.aggregate([{
          $match: {
            'to': ObjectId(stylist_id)
          }
        },
        {
          $lookup: {
            from: 'signups',
            localField: 'from',
            foreignField: '_id',
            as: 'user',
          }
        },
        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
      ])
      //console.log('data', data.length);
      return successWithData(res, 'Reviews Found', data);
    } catch (err) {
      console.log(err);
    }
  },

  //--------------------Api for stylist to get the review given by stylist to user--------------//
  getstylistgivenreview: async function (req, res) {
    try {
      var stylist_id = req.user.id;
      var data = await userreviewDB.aggregate([{
          $match: {
            'from': ObjectId(stylist_id)
          }
        },
        {
          $lookup: {
            from: 'signups',
            localField: 'to',
            foreignField: '_id',
            as: 'user',
          }
        },
        {
          $lookup: {
            from: 'reviewimages',
            localField: '_id',
            foreignField: 'review_id',
            as: 'reviewimages',
          }
        },
      ])
      //console.log('data', data.length);
      res.send({
        code: 200,
        success: true,
        data: data,
        message: 'Reviews Data Found Successfully'
      })
      //return successWithData(res, 'Reviews Found', data);
    } catch (err) {
      console.log(err);
    }
  },
}