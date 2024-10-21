// const Img = ({url, caption}) => {
//     return (
//         <div>
//             <img src={url} alt={caption} />
//             {caption.length > 0 && (
//                 <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
//                     {caption}
//                 </p>
//             )}
//         </div>
//     );
// };


const Quote = ({ quote, caption }) => {
    return (
        <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple ">
            {/* Render the quote with dangerouslySetInnerHTML */}
            <p className="text-xl leading-10 md:text-2xl" dangerouslySetInnerHTML={{ __html: quote }}></p>
            {caption.length > 0 && (
                <p className="w-full text-purple text-base">{caption}</p>
            )}
        </div>
    );
};


const List = ({style,items}) => {
    return (
        <ol className={`pl-5 ${style == "ordered" ? "list-decimal" : "list-disc"}`}> 

            {
                items.map((listItem,i) => {
                    return <li key={i} className="my-4" dangerouslySetInnerHTML={{__html : listItem}}></li>
                })
            }
        </ol>
    )
}

const CodeBlock = ({ code, language }) => {
    return (
        <pre className="bg-grey-900 text-green-500 p-4 rounded-md overflow-x-auto">
            <code className={`language-${language}`}>
                {code}
            </code>
        </pre>
    );
};



const BlogContent = ({block}) => {
    let { type , data } = block 

    if(type=="paragraph"){
        return <p dangerouslySetInnerHTML={{__html : data.text}}></p>
    }
    if(type=="header"){
        if(data.level == 3){
            return <h3 className="text-3xl font-bold" dangerouslySetInnerHTML={{__html : data.text}}></h3>
        }
        return <h2 className="text-4xl font-bold" dangerouslySetInnerHTML={{__html : data.text}}></h2>
    }

    // if(type=="image"){
    //     return <Img url={data.file.url} caption={data.caption}/>
    // }
        
    if (type == "quote") {
        return <Quote quote={data.text} caption={data.caption} />;
    }
    

    if(type=="list"){
        return <List style={data.style} items = {data.items} />
    }

    if (type == "code") {
        return <CodeBlock code={data.code} language={data.language || "plaintext"} />;
    }


    else {
        return <h1>this is a block</h1>
    }

}


export default BlogContent