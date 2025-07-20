import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaThumbsUp, FaThumbsDown, FaComment, FaCheck, FaBell, FaPlus, FaBookmark, FaShare } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/Forum.css'; 

const Forum = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');

  // Rich text editor modules
  const modules = {
    toolbar: [
      ['bold', 'italic', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'align': [] }],
      ['emoji']
    ],
  };

  // Sample questions data
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: "How to optimize React component rendering?",
      author: "Rahul Patel",
      date: "2 hours ago",
      tags: ["React", "Performance", "Frontend"],
      description: "<p>I'm working on a large React application and noticing some performance issues. What are the best practices for optimizing component rendering?</p>",
      answers: [
        {
          id: 1,
          author: "Priya Sharma",
          date: "1 hour ago",
          content: "<p>You should use React.memo for functional components and PureComponent for class components to prevent unnecessary re-renders.</p>",
          upvotes: 8,
          downvotes: 1,
          isAccepted: false
        },
        {
          id: 2,
          author: "Admin",
          date: "30 minutes ago",
          content: "<p>Also consider using the useCallback hook to memoize functions and useMemo for expensive calculations.</p>",
          upvotes: 12,
          downvotes: 0,
          isAccepted: true
        }
      ],
      views: 124
    },
    {
      id: 2,
      title: "Best practices for JWT authentication in Node.js",
      author: "Amit Kumar",
      date: "1 day ago",
      tags: ["Node.js", "JWT", "Authentication"],
      description: "<p>I'm implementing JWT authentication for my Node.js API. What are the security best practices I should follow?</p>",
      answers: [
        {
          id: 3,
          author: "Sneha Gupta",
          date: "20 hours ago",
          content: "<p>Always store your JWT secret securely in environment variables and never in your codebase.</p>",
          upvotes: 15,
          downvotes: 2,
          isAccepted: false
        }
      ],
      views: 89
    }
  ]);

  // Available tags for selection
  const availableTags = [
    "React", "Node.js", "JavaScript", "TypeScript", "JWT", 
    "Authentication", "Performance", "Frontend", "Backend", "Database"
  ];

  // Handle new question input changes
  const handleNewQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

  // Handle rich text editor change
  const handleDescriptionChange = (value) => {
    setNewQuestion(prev => ({ ...prev, description: value }));
  };

  // Add tag to new question
  const handleAddTag = (tag) => {
    if (!newQuestion.tags.includes(tag)) {
      setNewQuestion(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Remove tag from new question
  const handleRemoveTag = (tagToRemove) => {
    setNewQuestion(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Submit new question
  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    
    const newQuestionObj = {
      id: Math.max(...questions.map(q => q.id)) + 1,
      title: newQuestion.title,
      author: "Current User",
      date: "Just now",
      tags: newQuestion.tags,
      description: newQuestion.description,
      answers: [],
      views: 0
    };

    setQuestions([newQuestionObj, ...questions]);
    setShowNewQuestionModal(false);
    setNewQuestion({
      title: '',
      description: '',
      tags: []
    });
  };

  // Handle voting on answers
  const handleVote = (questionId, answerId, type) => {
    setQuestions(questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          answers: question.answers.map(answer => {
            if (answer.id === answerId) {
              return {
                ...answer,
                upvotes: type === 'upvote' ? answer.upvotes + 1 : answer.upvotes,
                downvotes: type === 'downvote' ? answer.downvotes + 1 : answer.downvotes
              };
            }
            return answer;
          })
        };
      }
      return question;
    }));
  };

  // Mark answer as accepted
  const acceptAnswer = (questionId, answerId) => {
    setQuestions(questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          answers: question.answers.map(answer => ({
            ...answer,
            isAccepted: answer.id === answerId
          }))
        };
      }
      return question;
    }));
  };

  // Submit new answer
  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    const newAnswerObj = {
      id: Math.max(...activeQuestion.answers.map(a => a.id), 0) + 1,
      author: "Current User",
      date: "Just now",
      content: newAnswer,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false
    };

    setQuestions(questions.map(question => {
      if (question.id === activeQuestion.id) {
        return {
          ...question,
          answers: [...question.answers, newAnswerObj]
        };
      }
      return question;
    }));

    setNewAnswer('');
    setActiveQuestion({
      ...activeQuestion,
      answers: [...activeQuestion.answers, newAnswerObj]
    });
  };

  // Filter questions based on active tab & search query
  const filteredQuestions = questions.filter(question => {
    const matchesTab = 
      activeTab === 'all' || 
      question.tags.some(tag => tag.toLowerCase().includes(activeTab));
    
    const matchesSearch = 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      question.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadNotifications(0);
    }
  };

  return (
    <div className={`forum-terminal ${darkMode ? 'dark-terminal' : ''}`}>
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-header-left">
          <h1 className="terminal-title">STACKIT Q&A TERMINAL</h1>
          <div className="terminal-path">/questions/active</div>
        </div>
        <div className="terminal-header-right">
          <div 
            className="notification-icon"
            onClick={toggleNotifications}
          >
            <FaBell />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notification-item">
                  <p>Priya answered your question about React optimization</p>
                  <span className="notification-time">2h ago</span>
                </div>
                <div className="notification-item">
                  <p>Admin mentioned you in a comment</p>
                  <span className="notification-time">1d ago</span>
                </div>
                <div className="notification-item">
                  <p>3 new questions in tags you follow</p>
                  <span className="notification-time">2d ago</span>
                </div>
              </div>
            )}
          </div>
          <button 
            className="terminal-button ask-question-btn"
            onClick={() => setShowNewQuestionModal(true)}
          >
            <FaPlus /> NEW QUERY
          </button>
        </div>
      </div>

      {/* Terminal Command Bar */}
      <div className="terminal-command-bar">
        <div className="command-bar-left">
          <div className="terminal-tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              ALL QUERIES
            </button>
            <button
              className={`tab-btn ${activeTab === 'react' ? 'active' : ''}`}
              onClick={() => setActiveTab('react')}
            >
              REACT
            </button>
            <button
              className={`tab-btn ${activeTab === 'node' ? 'active' : ''}`}
              onClick={() => setActiveTab('node')}
            >
              NODE.JS
            </button>
            <button
              className={`tab-btn ${activeTab === 'javascript' ? 'active' : ''}`}
              onClick={() => setActiveTab('javascript')}
            >
              JAVASCRIPT
            </button>
          </div>
        </div>
        <div className="command-bar-right">
          <div className="terminal-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="SEARCH QUERIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="terminal-content">
        <AnimatePresence>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <motion.div
                key={question.id}
                className={`terminal-card ${activeQuestion?.id === question.id ? 'expanded' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="question-summary"
                  onClick={() => setActiveQuestion(activeQuestion?.id === question.id ? null : question)}
                >
                  <div className="question-stats">
                    <div className="stat">
                      <span>{question.answers.reduce((acc, ans) => acc + ans.upvotes - ans.downvotes, 0)}</span>
                      <small>VOTES</small>
                    </div>
                    <div className={`stat ${question.answers.some(a => a.isAccepted) ? 'has-accepted' : ''}`}>
                      <span>{question.answers.length}</span>
                      <small>ANSWERS</small>
                    </div>
                    <div className="stat">
                      <span>{question.views}</span>
                      <small>VIEWS</small>
                    </div>
                  </div>
                  
                  <div className="question-content">
                    <h3>{question.title}</h3>
                    <div 
                      className="question-preview"
                      dangerouslySetInnerHTML={{ __html: question.description.substring(0, 150) + (question.description.length > 150 ? '...' : '') }}
                    />
                    <div className="question-footer">
                      <div className="question-tags">
                        {question.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      <div className="question-meta">
                        <span className="question-author">@{question.author}</span>
                        <span className="question-date">{question.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded question view */}
                {activeQuestion?.id === question.id && (
                  <div className="question-detail">
                    <div 
                      className="question-description"
                      dangerouslySetInnerHTML={{ __html: question.description }}
                    />
                    
                    <div className="answers-section">
                      <h4>{question.answers.length} ANSWERS</h4>
                      
                      {question.answers.map(answer => (
                        <div 
                          key={answer.id} 
                          className={`answer-card ${answer.isAccepted ? 'accepted' : ''}`}
                        >
                          <div className="answer-votes">
                            <button onClick={() => handleVote(question.id, answer.id, 'upvote')}>
                              <FaThumbsUp />
                            </button>
                            <span>{answer.upvotes - answer.downvotes}</span>
                            <button onClick={() => handleVote(question.id, answer.id, 'downvote')}>
                              <FaThumbsDown />
                            </button>
                            {question.author === "Current User" && (
                              <button 
                                className={`accept-btn ${answer.isAccepted ? 'accepted' : ''}`}
                                onClick={() => acceptAnswer(question.id, answer.id)}
                                title="Mark as accepted answer"
                              >
                                <FaCheck />
                              </button>
                            )}
                          </div>
                          <div 
                            className="answer-content"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />
                          <div className="answer-meta">
                            <span className="answer-author">@{answer.author}</span>
                            <span className="answer-date">{answer.date}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Answer form */}
                      <form className="answer-form" onSubmit={handleSubmitAnswer}>
                        <h4>POST ANSWER</h4>
                        <ReactQuill
                          value={newAnswer}
                          onChange={setNewAnswer}
                          modules={modules}
                          placeholder="Write your answer here..."
                          theme="snow"
                        />
                        <button type="submit" className="terminal-button submit-answer-btn">
                          SUBMIT RESPONSE
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              className="no-questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>NO QUERIES FOUND. INITIATE NEW QUERY.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Footer */}
      <div className="terminal-footer">
        <div className="footer-left">
          <span>STATUS: ACTIVE</span>
          <span>USERS ONLINE: 124</span>
        </div>
        <div className="footer-right">
          <span>STACKIT v2.0</span>
          <span>COLLABORATIVE LEARNING TERMINAL</span>
        </div>
      </div>

      {/* New Question Modal */}
      <AnimatePresence>
        {showNewQuestionModal && (
          <motion.div 
            className="terminal-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewQuestionModal(false)}
          >
            <motion.div 
              className="terminal-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>INITIATE NEW QUERY</h2>
                <button 
                  className="close-modal"
                  onClick={() => setShowNewQuestionModal(false)}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitQuestion}>
                <div className="form-group">
                  <label htmlFor="question-title">QUERY TITLE</label>
                  <input
                    id="question-title"
                    type="text"
                    name="title"
                    value={newQuestion.title}
                    onChange={handleNewQuestionChange}
                    required
                    placeholder="Enter query title"
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="question-description">QUERY DETAILS</label>
                  <ReactQuill
                    id="question-description"
                    value={newQuestion.description}
                    onChange={handleDescriptionChange}
                    modules={modules}
                    placeholder="Provide detailed information about your query..."
                    theme="snow"
                  />
                </div>
                
                <div className="form-group">
                  <label>TAGS</label>
                  <div className="tags-container">
                    <div className="available-tags">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className={`tag-btn ${newQuestion.tags.includes(tag) ? 'selected' : ''}`}
                          onClick={() => newQuestion.tags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="selected-tags">
                      {newQuestion.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="terminal-button cancel-btn"
                    onClick={() => setShowNewQuestionModal(false)}
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="terminal-button submit-btn"
                  >
                    POST QUERY
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Forum;