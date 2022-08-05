//@ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../../style/NewQuizStyle.css'
import QuizCreated from '../../img/NewQuizImg/quiz_created.svg'

import {
  Chip,
  TextField,
  Button,
  Typography,
  Divider,
  Switch,
  TextareaAutosize,
  ClickAwayListener,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { toast } from 'react-toastify'
import { AddCircleRounded, SaveAs, DeleteRounded } from '@mui/icons-material'
import UploadButton from '../misc/UploadButton'

import 'react-quill/dist/quill.snow.css'
import ReactQuill from 'react-quill'

import { useMutation, gql } from '@apollo/client'

//hooks
import getUser from '../../hooks/getUser'
import useUnsavedChangesWarning from '../../hooks/useUnsavedChangesWarning'

//imgs
import QuesImg from '../../img/CardType/Image_Answer.svg'
import QuesAns from '../../img/CardType/Question_Answer.svg'
import uploadImg from '../../img/uploadImg.svg'
import CropperComponent from '../misc/CropperComponent'
import useTranslations from '../../hooks/useTranslations'

const CREATE_MULTI_QUIZ = gql`
  mutation createMulti(
    $name: String!
    $coverImg: String!
    $tags: [String]
    $userID: ID!
    $userProfilePic: String!
    $userName: String!
    $steps: String!
    $description: String!
  ) {
    createMulti(
      name: $name
      coverImg: $coverImg
      tags: $tags
      userID: $userID
      userProfilePic: $userProfilePic
      userName: $userName
      steps: $steps
      description: $description
    )
  }
`

const CREATE_PRIVATE_MULTI_QUIZ = gql`
  mutation createPrivateMulti(
    $name: String!
    $coverImg: String!
    $tags: [String]
    $userID: ID!
    $userProfilePic: String!
    $userName: String!
    $steps: String!
    $description: String!
  ) {
    createPrivateMulti(
      name: $name
      coverImg: $coverImg
      tags: $tags
      userID: $userID
      userProfilePic: $userProfilePic
      userName: $userName
      steps: $steps
      description: $description
    )
  }
`

function NewMultiQuiz() {
  const [step, setStep] = useState(0)
  const user = getUser()
  const [name, setName] = useState('')
  const [quizArray, setQuizArray] = useState([])
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState('')
  const [tagNumber, setTagNumber] = useState(0)
  const [description, setDescription] = useState('')

  const translations = useTranslations()

  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning()

  const quizObj = {}

  //
  const [imgSrc, setImgSrc] = useState('')

  const [createMulti, { data, loading, error }] = useMutation(CREATE_MULTI_QUIZ)
  const [
    createPrivateMulti,
    { data: privateData, loading: privateLoading, error: privateError },
  ] = useMutation(CREATE_PRIVATE_MULTI_QUIZ)

  const [isPrivate, setIsPrivate] = useState(false)
  const [isAddQuestion, setIsAddQuestion] = useState({
    isAddQuestion: false,
    subIndex: null,
  })
  const [isUploadingCard, setIsUploadingCard] = useState({
    isUploading: false,
    subIndex: null,
    questionIndex: null,
  })

  useEffect(() => {
    toast.info(translations.alerts.eachansdifferent)
  }, [])

  const Card = ({ data, index, subIndex }) => {
    const [question, setQuestion] = useState(data.question)
    const [answer, setAnswer] = useState(data.answer)

    const type = data.type

    return (
      <div className="card2">
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Typography variant="h3" style={{ textAlign: 'left' }}>
              {index + 1}
            </Typography>

            <TextareaAutosize
              className="questions userInput"
              onChange={(e) => setQuestion(e.target.value)}
              value={question}
              style={{
                minWidth: '250px',
                width: '250px',
                height: '100px',
                maxHeight: '150px',
                borderRadius: '5px',
                border: '1px solid #e0e0e0',
              }}
              placeholder={translations.newmultiquiz.questions.question + ' 💭'}
            />
            <br></br>
            <TextareaAutosize
              className="answers userInput"
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              style={{
                minWidth: '250px',
                width: '250px',
                height: '100px',
                maxHeight: '150px',
                borderRadius: '5px',
                border: '1px solid #e0e0e0',
              }}
              placeholder={translations.newmultiquiz.questions.answer + '💡'}
            />
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              color="success"
              onClick={() =>
                SaveQuestion(subIndex, index, question, answer, type)
              }
            >
              ✨ {translations.newmultiquiz.questions.save}
            </Button>
            <div style={{ width: '10px', height: '10px' }} />
            <Button
              color="secondary"
              onClick={() => DeleteQuestion(subIndex, index)}
            >
              ❌ {translations.newmultiquiz.questions.delete}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const CardImg = ({ data, index, subIndex }) => {
    const [question, setQuestion] = useState(data.question)
    const [answer, setAnswer] = useState(data.answer)

    const type = data.type

    return (
      <div className="card2">
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Typography variant="h3" style={{ textAlign: 'left' }}>
              {index + 1}
            </Typography>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <div
                onClick={() => {
                  setIsUploadingCard({
                    isUploading: true,
                    subIndex: subIndex,
                    questionIndex: index,
                  })
                }}
                className="upload-box-button"
              >
                {question === '' ? (
                  <img
                    src={uploadImg}
                    alt="upload"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <img
                    src={question}
                    alt="upload"
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
              </div>
            </div>
            <br></br>
            <TextareaAutosize
              className="answers userInput"
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              style={{
                minWidth: '250px',
                width: '250px',
                height: '100px',
                maxHeight: '150px',
                borderRadius: '5px',
                border: '1px solid #e0e0e0',
              }}
              placeholder={translations.newmultiquiz.questions.answer + '💡'}
            />
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              color="success"
              onClick={() =>
                SaveQuestion(subIndex, index, question, answer, type)
              }
            >
              ✨ {translations.newmultiquiz.questions.save}
            </Button>
            <div style={{ width: '10px', height: '10px' }} />
            <Button
              color="secondary"
              onClick={() => DeleteQuestion(subIndex, index)}
            >
              ❌ {translations.newmultiquiz.questions.delete}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const Subject = ({ index, name, cards }) => {
    const [subjectName, setSubjectName] = useState(name)
    const [subjectCards] = useState(cards)

    return (
      <div className="subject-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <input
            className="subject-name"
            onChange={(e) => setSubjectName(e.target.value)}
            value={subjectName}
            type="text"
            placeholder={translations.newmultiquiz.subjects.input}
          />
          <SaveAs
            htmlColor="#1bb978"
            style={{ width: '50px', height: '50px', marginLeft: '10px' }}
            onClick={() => saveSubjectName(index, subjectName)}
          />
          <DeleteRounded
            color="secondary"
            style={{ width: '50px', height: '50px', marginLeft: '10px' }}
            onClick={() => deleteSubject(index)}
          />
        </div>
        <div className="cardContainer2" style={{ margin: '1%' }}>
          {subjectCards.map((card, i) =>
            card.type === 'ques_ans' ? (
              <Card
                key={card.question + index}
                subIndex={index}
                data={card}
                index={i}
              />
            ) : card.type === 'ques_img' ? (
              <CardImg
                key={card.question + index}
                subIndex={index}
                data={card}
                index={i}
              />
            ) : null
          )}
          <div
            onClick={() => {
              setIsAddQuestion({
                subIndex: index,
                isAddQuestion: true,
              })
            }}
            className="card2-2"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AddCircleRounded
              style={{ width: '75px', height: '75px' }}
              color="primary"
            />
          </div>
        </div>
      </div>
    )
  }

  const AddQuestion = (subjectIndex, type) => {
    if (quizArray[subjectIndex].cards.length >= 12) return
    const card = {
      question: '',
      answer: '',
      type: type,
    }
    const newQuizArray = [...quizArray]
    console.log(newQuizArray)
    console.log(subjectIndex)
    newQuizArray[subjectIndex].cards.push(card)
    setQuizArray(newQuizArray)
  }

  const setImage = (subjectIndex, questionIndex, img) => {
    const newQuizArray = [...quizArray]
    console.log(subjectIndex, questionIndex, img)
    console.log(newQuizArray[subjectIndex].cards)
    newQuizArray[subjectIndex].cards[questionIndex].question = img
    setQuizArray(newQuizArray)
    setIsUploadingCard({
      subjectIndex: null,
      questionIndex: null,
      isUploading: false,
    })
  }

  const SaveQuestion = (
    subjectIndex,
    questionIndex,
    question,
    answer,
    type
  ) => {
    const newQuizArray = [...quizArray]
    newQuizArray[subjectIndex].cards[questionIndex].question = question
    newQuizArray[subjectIndex].cards[questionIndex].answer = answer
    setQuizArray(newQuizArray)
    toast.success(translations.alerts.saved, {
      autoClose: 500,
    })
  }
  const DeleteQuestion = (subjectIndex, questionIndex) => {
    const newQuizArray = [...quizArray]
    newQuizArray[subjectIndex].cards.splice(questionIndex, 1)
    setQuizArray(newQuizArray)
    toast.error(translations.alerts.deleted, {
      autoClose: 500,
    })
  }

  const AddSubject = () => {
    const subjectObj = {
      name: '',
      cards: [],
    }
    setQuizArray([...quizArray, subjectObj])
  }

  const saveSubjectName = (subjectIndex, name) => {
    const newQuizArray = [...quizArray]
    newQuizArray[subjectIndex].name = name
    setQuizArray(newQuizArray)
    toast.success(translations.alerts.saved, {
      autoClose: 500,
    })
  }

  const deleteSubject = (subjectIndex) => {
    const newQuizArray = [...quizArray]
    newQuizArray.splice(subjectIndex, 1)
    setQuizArray(newQuizArray)
    toast.error(translations.alerts.deleted, {
      autoClose: 500,
    })
  }

  const getTags = () => {
    const newTagArr = []
    tags.map((tag) => {
      newTagArr.push(tag)
    })
    return newTagArr
  }

  const Submit = () => {
    const newQuizArray = [...quizArray]

    if (name === '') {
      toast.error(translations.alerts.quiznameempty)
      return
    }

    if (newQuizArray.length === 0) {
      toast.error(translations.alerts.need1subject)
      return
    }

    for (let i = 0; i < newQuizArray.length; i++) {
      const subject = newQuizArray[i]
      const cards = subject.cards

      if (cards.length < 6) {
        toast.error(translations.alerts.min6questions)
        return
      }

      if (subject.name === '') {
        toast.error(translations.alerts.fieldleftempty)
        return
      }

      for (let j = 0; j < cards.length; j++) {
        const card = cards[j]
        if (card.question === '' || card.answer === '') {
          toast.error(translations.alerts.fieldleftempty)
          return
        }
      }
    }

    if (isPrivate) {
      createPrivateMulti({
        variables: {
          name: quizObj.name,
          coverImg: quizObj.coverImg,
          tags: quizObj.tags,
          userID: quizObj.userID,
          userProfilePic: quizObj.userProfilePic,
          userName: quizObj.userName,
          steps: JSON.stringify(quizObj.steps),
          description: quizObj.description,
        },
      })
    } else {
      createMulti({
        variables: {
          name: quizObj.name,
          coverImg: quizObj.coverImg,
          tags: quizObj.tags,
          userID: quizObj.userID,
          userProfilePic: quizObj.userProfilePic,
          userName: quizObj.userName,
          steps: JSON.stringify(quizObj.steps),
          description: quizObj.description,
        },
      })
    }
    toast.success(translations.alerts.quizcreated)
    setQuizArray([])
    quizObj = {}
    setTags([])
    setDescription([])
    setName([])
    setImgSrc([])
  }

  const setQuizObj = (isPrivate, name, description) => {
    if (user == null) {
      window.location = '/login'
      toast.error(translations.alerts.logincreatequiz)
      return
    }
    quizObj.name = name
    quizObj.userName = user?.profileObj.name
    quizObj.userProfilePic = user.profileObj.imageUrl
    quizObj.userID = user.profileObj.googleId
    quizObj.coverImg = imgSrc || ''
    quizObj.tags = getTags()
    quizObj.description = description

    const stepObj = {}

    const cloneQuizArray = [...quizArray]
    console.log(cloneQuizArray)
    for (let i = 0; i < cloneQuizArray.length; i++) {
      const subject = cloneQuizArray[i]
      const cards = cloneQuizArray[i].cards
      stepObj[subject.name] = {}

      for (let j = 0; j < cards.length; j++) {
        const card = cards[j]
        stepObj[subject.name][`q${j}`] = card
      }
    }

    console.log(stepObj)
    quizObj.steps = stepObj
    console.log(quizObj)
    Submit(isPrivate)
  }

  const AddTag = (tag) => {
    if (tag === '') return
    if (tagNumber >= 5) return
    setTags([...tags, tag])
    setCurrentTag('')
    setTagNumber(tagNumber + 1)
  }

  const handleDelete = (id, name) => {
    const newTags = []
    tags.map((tag) => {
      newTags.push(tag)
    })
    newTags.splice(name, 1)
    setTags(newTags)
    setTagNumber(newTags.length)
  }

  const AddQuestionForm = () => (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: '0',
        zIndex: '9999',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <ClickAwayListener
        onClickAway={() => {
          setIsAddQuestion(false)
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            backgroundColor: 'white',
            border: '2px solid black',
            padding: '10px',
          }}
        >
          <Typography variant="h3" style={{ textAlign: 'center' }}>
            {translations.newmultiquiz.questions.select}
          </Typography>
          <br></br>
          <Divider />
          <br></br>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              className="card_type"
              style={{
                margin: '20px',
                border: '2px solid black',
              }}
              onClick={() => {
                AddQuestion(isAddQuestion.subIndex, 'ques_ans')
              }}
            >
              <img src={QuesAns} style={{ width: '150px', height: '150px' }} />
            </div>
            <div
              className="card_type"
              style={{
                margin: '20px',
                border: '2px solid black',
              }}
              onClick={() => {
                AddQuestion(isAddQuestion.subIndex, 'ques_img')
              }}
            >
              <img src={QuesImg} style={{ width: '150px', height: '150px' }} />
            </div>
          </div>
        </div>
      </ClickAwayListener>
    </div>
  )

  return (
    <>
      {isAddQuestion.isAddQuestion ? <AddQuestionForm /> : null}
      {isUploadingCard.isUploading ? (
        <CropperComponent
          setImage={setImage}
          index={isUploadingCard.questionIndex}
          subIndex={isUploadingCard.subIndex}
          mode={'multi'}
          close={() => {
            setIsUploadingCard({
              questionIndex: null,
              subIndex: null,
              isUploading: false,
            })
          }}
        />
      ) : null}
      <div
        style={{
          marginTop: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
        }}
      >
        {Prompt}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'white',
            margin: '10px',
            border: '2px solid black',
            boxShadow: '10px 10px 0 #262626',
            width: '90%',
            maxWidth: '900px',
            padding: '50px',
            paddingBottom: '0',
            paddingTop: '0',
          }}
        >
          <Stepper
            style={{
              width: '100%',
              maxWidth: '650px',
              overflowX: 'auto',
              margin: '30px',
            }}
            activeStep={step}
          >
            <Step>
              <StepLabel>{translations.newmultiquiz.stepper.step1}</StepLabel>
            </Step>
            <Step>
              <StepLabel>{translations.newmultiquiz.stepper.step2}</StepLabel>
            </Step>
            <Step>
              <StepLabel>{translations.newmultiquiz.stepper.step3}</StepLabel>
            </Step>
            <Step>
              <StepLabel>{translations.newmultiquiz.stepper.step4}</StepLabel>
            </Step>
            <Step>
              <StepLabel>{translations.newmultiquiz.stepper.step5}</StepLabel>
            </Step>
          </Stepper>
          {step === 0 && (
            <div>
              <Typography variant="h3" style={{ margin: '10px' }}>
                <b>{translations.newmultiquiz.step1}</b>
              </Typography>
              <br></br>
              <Divider style={{ width: '90%', height: '1px' }} />
              <br></br>
              <input
                className="userInput quizName"
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder={translations.newmultiquiz.input}
              />
            </div>
          )}
          {step === 1 && (
            <>
              <Typography variant="h3" style={{ margin: '10px' }}>
                <b>{translations.newmultiquiz.step2}</b>
              </Typography>
              <br></br>
              <Divider style={{ width: '90%', height: '1px' }} />
              <br></br>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  marginTop: '10px',
                }}
              >
                <UploadButton setImg={setImgSrc} url={imgSrc} />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <Typography variant="h3" style={{ margin: '10px' }}>
                <b>
                  <b>{translations.newmultiquiz.description}</b>
                </b>
              </Typography>
              <br></br>
              <Divider style={{ width: '90%', height: '1px' }} />
              <br></br>
              <ReactQuill
                theme="snow"
                value={description}
                placeholder={translations.newmultiquiz.description}
                onChange={setDescription}
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  height: '400px',
                  marginTop: '10px',
                  marginBottom: '50px',
                }}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Typography variant="h3" style={{ margin: '10px' }}>
                <b>{translations.newmultiquiz.step3}</b>
              </Typography>
              <br></br>
              <Divider style={{ width: '90%', height: '1px' }} />
              <br></br>
              <div
                style={{
                  padding: '15px',
                  width: '80vw',
                  maxWidth: '700px',
                  marginTop: '10px',
                }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  label={translations.newmultiquiz.tags.input}
                  helperText={
                    <span style={{ color: 'black' }}>
                      {5 - tagNumber}{' '}
                      {translations.newmultiquiz.tags.helpertext}
                    </span>
                  }
                  onChange={(e) => {
                    setCurrentTag(e.target.value)
                  }}
                  value={currentTag}
                />
                <Button
                  variant="contained"
                  size="medium"
                  color="primary"
                  onClick={() => {
                    AddTag(currentTag)
                  }}
                >
                  {translations.newmultiquiz.tags.button}
                </Button>
                <br></br>
                {tags.map((tag, index) => (
                  <Chip
                    style={{ marginTop: '10px' }}
                    key={tag + index}
                    id={tag + index}
                    label={'#' + tag}
                    onDelete={() => handleDelete(tag + index, tag)}
                    color="primary"
                  />
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <Typography variant="h3" style={{ margin: '10px' }}>
                <b>{translations.newmultiquiz.qna}</b>
              </Typography>
              <br></br>
              <Divider style={{ width: '90%', height: '1px' }} />
              <br></br>
              <div className="cardContainer2-sub" id="cardContainer2-sub">
                {quizArray.map((subject, index) => {
                  return (
                    <Subject
                      key={index}
                      index={index}
                      name={subject.name}
                      cards={subject.cards}
                    />
                  )
                })}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    onClick={() => {
                      AddSubject()
                    }}
                    className="card2-2-subject"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AddCircleRounded
                      style={{ width: '75px', height: '75px' }}
                      color="primary"
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" style={{ margin: '10px' }}>
                    {translations.newmultiquiz.private}
                  </Typography>
                  <Switch
                    size="medium"
                    checked={isPrivate}
                    onChange={() => {
                      setIsPrivate(!isPrivate)
                    }}
                    color="primary"
                    name="checked"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                </div>
              </div>
            </>
          )}
          {step === 5 && (
            <div
              style={{
                margin: '10px',
              }}
            >
              <Typography variant="h3" style={{ margin: '10px' }}>
                <b>{translations.newmultiquiz.success}</b>
              </Typography>
              <br></br>
              <Divider style={{ width: '90%', height: '1px' }} />
              <br></br>
              <img draggable="false" src={QuizCreated} alt="quiz" />
              <div
                style={{
                  margin: '10px',
                  marginTop: '40px',
                }}
              >
                <Link to="/">
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      marginRight: '10px',
                    }}
                  >
                    {translations.newmultiquiz.return}
                  </Button>
                </Link>
                {/* <Link to="/practice/normal/quiz:0134479a-12f7-4bb2-b48c-a14a4af2b2a5">
                  <Button variant="contained" color="action">
                    ..or test quiz 🎯 ?
                  </Button>
                </Link> */}
              </div>
            </div>
          )}
          {step < 5 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                margin: '10px',
                marginTop: '25px',
                marginBottom: '25px',
              }}
            >
              <Button
                variant="contained"
                style={{
                  marginRight: '10px',
                }}
                color="secondary"
                onClick={() => {
                  if (step === 0) return
                  setStep(step - 1)
                }}
              >
                {translations.newmultiquiz.back}
              </Button>
              {step < 4 ? (
                <Button
                  variant="contained"
                  color="action"
                  onClick={() => {
                    if (step === 4) return
                    setStep(step + 1)
                  }}
                >
                  {translations.newmultiquiz.next}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setQuizObj(isPrivate, name, description)
                  }}
                >
                  {translations.newmultiquiz.button}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NewMultiQuiz

// ~ TODO: Add titles top each step ~
// ~ TODO: Adjust the subject div size ~
// ~ TODO: Test to see if it works ~
