// Importing tools
// import EditorJs from "@editorjs/editorjs";
 
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
// import Image from "@editorjs/image"; // Corrected import for Image tool
import Link from "@editorjs/link";
import Code from "@editorjs/code";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code"; 
// import { uploadImage } from "../common/aws"

// const uploadImageByFile = (e) => {
//     return uploadImage = (e) => {
//         if(url) {
//             return {
//                 success:1,
//                 file:url
//             }
//         }
//     }
// }


// // Function to handle image upload by URL
// const uploadImageByUrl = (e) => {
//     let link = new Promise((resolve, reject) => {
//         try {
//             resolve(e);
//         } catch (err) {
//             reject(err);
//         }
//     });
    
//     return link.then(url => {
//         return {
//             success: 1,
//             file: { url }
//         };
//     });
// };

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true,
    },
    header: {
        class: Header,
        inlineToolbar: true,
        config: {
            placeholder: "Type heading...",
            levels: [2, 3],
            defaultLevel: 2 // Fixed typo here
        }
    },
    // image: {
    //     class: Image,
    //     // config: {
    //     //     uploadByUrl: uploadImageByUrl,
    //     //     // uploadByFile: yourFileUploadFunction, // Optional, if you want to handle file uploads
    //     // }
    // },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    link: Link,
    code: Code,
    inlineCode: InlineCode
};
