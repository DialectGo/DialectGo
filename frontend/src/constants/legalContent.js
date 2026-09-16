/**
 * Static legal and help content for the Settings modals.
 * Keeping this out of the screen component keeps SettingsScreen focused on
 * layout/behavior, and makes future edits (e.g. legal review) a content-only change.
 */

export const HOW_TO_USE_SECTIONS = [
  {
    heading: 'Opening the App and Account Creation',
    steps: [
      { label: 'Getting Started', description: 'Launch the DialectGo mobile application from your device to access the welcome screen.' },
      { label: 'Creating an Account', description: 'Tap the Sign Up button to begin the registration process.' },
      { label: 'Manual Registration', description: 'Complete the registration form by entering your credentials, a valid email address, and a secure password. Once all required information has been provided, submit the form to create your account.' },
      { label: 'Google Sign-Up', description: 'Alternatively, tap Sign Up with Google to quickly create an account or sign in using your existing Google account.' },
      { label: 'Logging In', description: "After creating an account, enter your login credentials on the sign-in screen to access the application's homepage." },
      { label: 'Recovering a Forgotten Password', description: 'If you forget your password, tap Forgot Password, enter your registered email address, and follow the instructions sent to your email to reset your password.' },
    ],
  },
  {
    heading: 'Using the Dictionary',
    steps: [
      { label: 'Accessing the Dictionary', description: 'Select the Dictionary module from the main navigation menu to search for words and language information.' },
      { label: 'Searching and Filtering', description: 'Use the search bar to enter a specific word or browse the available entries using the language and alphabetical filters.' },
      { label: 'Viewing Entry Details', description: 'Tap any dictionary entry to view its meaning, translation, pronunciation, part of speech, and example usage.' },
      { label: 'Saving Words', description: 'Save words for future reference by bookmarking them. Your saved entries can be accessed anytime through your profile.' },
    ],
  },
  {
    heading: 'Using the Translator',
    steps: [
      { label: 'Accessing the Translator', description: 'Navigate to the main menu and select the Translator module.' },
      { label: 'Selecting a Translation Method', description: 'Choose your preferred translation method: Text-to-Text, Speech-to-Text, or Text Reader.' },
      { label: 'Text-to-Text', description: 'Type the text you want to translate into the input field.' },
      { label: 'Speech-to-Text', description: 'Tap the microphone icon and speak clearly into your device. The application will automatically convert your speech into text before generating the translation.' },
      { label: 'Text Reader', description: 'Tap the document icon to upload an image or document containing text. The application will automatically read and extract the text before translating it.' },
      { label: 'Choosing Languages', description: 'Select the source language and the target language from the available language options. DialectGo supports translation between Cebuano, Tagalog, and English in all supported language combinations.' },
      { label: 'Viewing the Translation', description: 'Once the translation has been generated, review the translated output displayed on the screen.' },
      { label: 'Using Translation Breakdown', description: 'Tap the Breakdown feature to view a detailed explanation of the translated content, including word-by-word meanings, pronunciation, language origin, and additional usage examples.' },
      { label: 'Customizing the Translation', description: 'Use the Customization feature to regenerate the translation based on your preferred tone or intended audience, allowing the translated message to better match different communication contexts.' },
      { label: 'Exporting the Translation', description: 'If needed, export the translated content as a PDF or TXT file for future reference.' },
      { label: 'Submitting Suggestions', description: 'If you would like to contribute a better translation, tap the More Options menu (⋮) and submit your suggested translation for community and administrator review.' },
    ],
  },
  {
    heading: 'Using DialectWiki',
    steps: [
      { label: 'Exploring Community Content', description: 'Open the DialectWiki module to browse community-contributed language terms, discussions, and questions.' },
      { label: 'Searching for Posts', description: 'Use the available search and filter options to quickly locate topics or language entries that interest you.' },
      { label: 'Submitting Content', description: 'Share your knowledge by contributing new regional words, phrases, or community questions through the submission form.' },
      { label: 'Tracking Submission Status', description: 'Monitor the status of your submitted content to see whether it is currently pending review, verified, or rejected by the administrators.' },
      { label: 'Interacting with the AI Assistant', description: 'Use the built-in AI assistant to ask questions related to Philippine languages, dialects, culture, and community topics for additional learning and guidance.' },
      { label: 'Interacting with the Community', description: 'Engage with other users by liking, commenting on, or bookmarking community posts.' },
    ],
  },
  {
    heading: 'Managing Your Profile',
    steps: [
      { label: 'Accessing Your Profile', description: 'Tap your profile icon to open the Profile module.' },
      { label: 'Updating Your Information', description: 'Edit your personal information, change your profile picture, and manage your account preferences whenever necessary.' },
      { label: 'Viewing Your Activities', description: 'Access your personal activity history, including your DialectWiki contributions, translation history, and bookmarked community posts.' },
      { label: 'Tracking Your Streaks', description: 'Monitor your daily translation streaks and milestone progress to encourage continuous engagement with the application.' },
      { label: 'Accessing Additional Resources', description: "From the Profile module, you may also view the application's User Guide, Terms and Conditions, Privacy Policy, and information about DialectGo." },
      { label: 'Signing Out', description: 'To securely end your session, scroll to the bottom of the Profile page and tap Log Out. Before signing out, you may choose to save your login credentials on the device, allowing you to access your account more conveniently the next time you use the application.' },
    ],
  },
];

export const TERMS_AND_CONDITIONS_SECTIONS = [
  {
    heading: ' Acceptance of Terms',
    body: 'By creating an account, accessing, or using DialectGo, users agree to comply with these Terms and Conditions, as well as all applicable laws and regulations. Continued use of the application constitutes acceptance of any future modifications to these Terms and Conditions.',
  },
  {
    heading: ' Eligibility',
    body: 'DialectGo is intended for users who are at least eighteen (18) years of age. Users below the age of eighteen (18) may use the application only with the consent and supervision of a parent, legal guardian, or authorized educational institution. By accessing or using the application, users represent that they satisfy the applicable age requirement or have obtained the necessary consent.',
  },
  {
    heading: ' Purpose of the Application',
    body: 'DialectGo is a mobile trilingual translation application developed to facilitate communication among users through translations between Cebuano, Tagalog, and English. The application also provides supplementary language-learning and translation support features, including Translation Breakdown, Translation Customization, Dictionary, and an AI Assistant designed exclusively to assist users in navigating and utilizing the application\'s features.',
  },
  {
    heading: ' User Responsibilities',
    body: 'Users shall use DialectGo responsibly and only for lawful purposes. Users shall not use the application to engage in fraudulent, harmful, abusive, defamatory, or unlawful activities, nor to violate the rights of other individuals or organizations. Users are responsible for ensuring that any information or content they submit through the application complies with applicable laws and ethical standards.',
  },
  {
    heading: ' AI-Generated Content and Translation Accuracy',
    body: 'DialectGo utilizes artificial intelligence and machine learning technologies to generate translations and language-related analyses. While the application is designed to provide accurate and contextually appropriate results, translations, recommendations, and analyses may not always be complete, error-free, or suitable for every context. Users are solely responsible for reviewing and verifying all generated outputs before relying on them for academic, legal, medical, business, financial, or other critical purposes.',
  },
  {
    heading: ' User Data and Privacy',
    body: 'DialectGo may collect and store information necessary to provide its services, including user account information, translation history, bookmarked dictionary entries, user preferences, and feedback submitted through the application. Such information shall be processed solely for providing, maintaining, improving, and evaluating the application\'s services and shall be handled in accordance with the application\'s Privacy Policy and applicable data protection laws.',
  },
  {
    heading: ' Intellectual Property Rights',
    body: 'All content, materials, features, source code, designs, graphics, logos, trademarks, documentation, and other intellectual property associated with DialectGo shall remain the exclusive property of its developers or their respective owners, unless otherwise stated. Users shall not reproduce, modify, distribute, reverse engineer, or commercially exploit any portion of the application without prior written authorization from the developers.',
  },
  {
    heading: ' Service Availability',
    body: 'DialectGo requires an active internet connection for its core functionalities. Although reasonable efforts will be made to maintain continuous availability, the developers do not guarantee uninterrupted or error-free operation of the application. Temporary interruptions may occur due to maintenance, software updates, server issues, network connectivity, or other technical circumstances beyond the developers\' control.',
  },
  {
    heading: ' Updates and Modifications',
    body: 'The developers reserve the right, at their sole discretion, to modify, suspend, improve, or discontinue any feature, functionality, or component of the application at any time without prior notice. The developers likewise reserve the right to revise these Terms and Conditions whenever necessary. Continued use of DialectGo following such revisions shall constitute acceptance of the updated Terms and Conditions.',
  },
  {
    heading: ' Limitation of Liability',
    body: 'To the fullest extent permitted by applicable law, the developers of DialectGo shall not be held liable for any direct, indirect, incidental, consequential, or special damages arising from the use of, or inability to use, the application or any of its generated translations, analyses, recommendations, or other outputs. Users assume full responsibility for their use of the application and for any decisions or actions taken based on the information provided by the system.',
  },
  {
    heading: ' User Feedback',
    body: 'Users are encouraged to submit comments, suggestions, bug reports, and other feedback through the application\'s designated feedback mechanism. By voluntarily submitting feedback, users acknowledge that such information may be used by the developers solely for the purpose of improving the functionality, usability, performance, and overall quality of DialectGo without creating any obligation to provide compensation or attribution.',
  },
  {
    heading: 'Governing Provision',
    body: 'These Terms and Conditions shall be governed by and construed in accordance with the applicable laws, rules, and regulations of the Republic of the Philippines. Any issues arising from the use of the application shall be subject to the applicable legal provisions of the Philippines.',
  },
];

export const PRIVACY_POLICY_SECTIONS = [
  {
    heading: ' Information We Collect',
    body: 'To provide and improve the services offered by DialectGo, the application may collect personal information provided during account registration (name, email address, profile picture); translation history, saved words, bookmarked posts, and other user-generated content; community contributions submitted through DialectWiki, including posts, comments, reactions, and translation suggestions; user preferences and translation customization settings; feedback and bug reports voluntarily submitted by users; and basic device and application usage information necessary to maintain system functionality, security, and performance.',
  },
  {
    heading: ' How We Use Your Information',
    body: 'The information collected by DialectGo may be used to create and manage user accounts; provide translation, dictionary, and community services; synchronize user data across devices and sessions; personalize the user experience based on saved preferences; improve translation quality, application performance, and overall system reliability; analyze application usage to support future enhancements; and respond to technical concerns, user inquiries, and submitted feedback.',
  },
  {
    heading: ' Information Sharing',
    body: 'DialectGo does not sell, rent, or trade users\' personal information. User information may only be shared with authorized third-party service providers when necessary to support essential application functions, such as user authentication, cloud storage, artificial intelligence processing, analytics, or system maintenance. Any third-party service involved in processing user information is expected to implement appropriate privacy and security measures.',
  },
  {
    heading: ' Data Retention',
    body: 'User information will be retained only for as long as necessary to provide the application\'s services, fulfill legitimate operational purposes, comply with applicable legal requirements, resolve technical issues, or improve system performance. Information that is no longer required may be securely deleted or anonymized, where appropriate.',
  },
  {
    heading: ' Data Security',
    body: 'DialectGo implements reasonable administrative, technical, and organizational safeguards to protect user information from unauthorized access, disclosure, alteration, misuse, or destruction. Although appropriate security measures are employed, no method of electronic storage or internet transmission can guarantee absolute security.',
  },
  {
    heading: ' Your Rights',
    body: 'Subject to applicable laws and the application\'s available features, users may request to review, update, or delete their personal information. Users may also discontinue using the application at any time. Requests related to personal data will be addressed whenever reasonably practicable.',
  },
  {
    heading: ' Device Permissions',
    body: 'DialectGo may request access to certain device features to support specific application functionalities. These permissions may include access to the camera for the Text Reader feature and profile image selection, the microphone for Speech-to-Text translation, and device storage for exporting translated content or accessing files for translation. Such permissions will only be requested when required by the selected feature and may be managed through the device\'s permission settings.',
  },
  {
    heading: ' Children\'s Privacy',
    body: 'DialectGo is not intended to knowingly collect personal information from children without appropriate parental or guardian consent. If it is determined that personal information from a child has been unintentionally collected, reasonable steps will be taken to remove such information from the system.',
  },
  {
    heading: ' Updates to This Privacy Policy',
    body: 'This Privacy Policy may be revised periodically to reflect changes in the application\'s features, operational practices, or legal requirements. Users are encouraged to review this Privacy Policy regularly to remain informed of any updates. Continued use of the application after any revisions signifies acceptance of the updated Privacy Policy.',
  },
  {
    heading: ' Contact Information',
    body: 'For questions, concerns, or requests regarding this Privacy Policy or the handling of personal information, users may contact the DialectGo development team through the official communication channels provided within the application.',
  },
];