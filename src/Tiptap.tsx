import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Box, Button, Center, ButtonGroup, IconButton} from "@chakra-ui/react";
import {AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight, AiOutlineOrderedList, AiOutlineUnorderedList, AiOutlineSave, AiOutlineFolderOpen} from 'react-icons/ai'
import {readTextFile, writeTextFile} from '@tauri-apps/api/fs'
import {open, save} from '@tauri-apps/api/dialog'
import {emit, listen} from '@tauri-apps/api/event'
import { saveAs } from "file-saver";
import React, { useEffect, useState, useRef} from "react";
import { invoke } from "@tauri-apps/api";

const Tiptap =  () => {
    const [currentFile, setCurrentFile] = useState("");
    const [app, isApp] = useState(false)
    const inputFile = useRef(null);

    useEffect(()=> {
        try {
            invoke('app_state').then((event:boolean)=> isApp(event)) 
        } catch(e) {
            console.log(e)
        }
    }, []);

    const editor= useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types:['paragraph']
            }),
        ],
        enableInputRules: false,
        content: '',
    })

    async function openFile() {
        try {
            let filepath;
            if (app==false) {
                inputFile.current.click()
            }
            if (currentFile) {
                filepath = await open({defaultPath: currentFile});
            } else {
                filepath = await open();
                setCurrentFile(filepath)
            }
            let content = await readTextFile(filepath);
            editor?.commands.setContent(JSON.parse(content));
        }   catch(e) {
            console.log(e)
        }
    };
    
    async function saveFile() {
        try {
            let filepath;
            if (app == false){
                let blob = new Blob([JSON.stringify(editor?.getJSON())], {type: "text/plain;charset=utf-8"})
                saveAs(blob, 'test.json')
            } else{
                if (currentFile) {
                    filepath = await save({defaultPath: currentFile});
                } else {
                    filepath = await save();
                    setCurrentFile(filepath)
                }
                await writeTextFile({contents: JSON.stringify(editor?.getJSON()), path: filepath});
            }
            console.log(JSON.stringify(editor?.getJSON()))
        } catch(err) {
            console.log(err);
        }
    }
    
    return(
        <Center display={'flex'} flexDirection='column' minW='0' minH='0' maxH={'100vh'} h='100vh' gap={8} bg='gray.600'>
            <Button onClick={()=> console.log(app)}>click me</Button>
            <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-around"}
                px={6}
                my={6}
                gap={8}
                w={'75%'}
                h={'5em'}
                bg='gray.900'
                rounded={"lg"}
                boxShadow={"2xl"}
            >
                <ButtonGroup
                    className="fileOperations"
                    isAttached={true}
                >

                    <IconButton 
                        aria-label="save"
                        onClick={()=> saveFile()}
                        icon={<AiOutlineSave/>}/>
                    <input hidden={true} type="file" ref={inputFile}/>
                    <IconButton 
                        aria-label="open"
                        onClick={()=> openFile()}
                        icon={<AiOutlineFolderOpen/>}>
                        </IconButton>

                </ButtonGroup>

                <ButtonGroup
                    className="textStyles"
                    textColor={"gray.400"}
                    fontWeight={"bold"}
                    variant={"outline"}
                    isAttached={true}
                    h={"100%"}
                    alignItems="center"
                    >
                    <Button onClick={()=> editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')} tabIndex={-1} h={"50%"} _hover={{color:"white"}}>B</Button>
                    <Button onClick={()=> editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic')} tabIndex={-1} h={"50%"} _hover={{color:"white"}}><em>I</em></Button>
                </ButtonGroup>

                <ButtonGroup
                    alignItems={"center"}
                    className="alignment"
                    variant={"outline"}
                    color={"gray.400"}
                    isAttached={true}
                    h={"100%"}
                    >
                        <IconButton
                            aria-label="align left" 
                            onClick={()=> editor?.chain().focus().setTextAlign('left').run()}
                            h={"50%"} 
                            tabIndex={-1} 
                            _hover={{color:"white"}} 
                            icon={<AiOutlineAlignLeft size={20}/>}/>
                        <IconButton 
                            aria-label="align center" 
                            onClick={()=> editor?.chain().focus().setTextAlign('center').run()}
                            h={"50%"} 
                            tabIndex={-1} 
                            _hover={{color:"white"}} 
                            icon={<AiOutlineAlignCenter size={20}/>}/>
                        <IconButton 
                            aria-label="align right" 
                            onClick={()=> editor?.chain().focus().setTextAlign('right').run()}
                            h={"50%"} 
                            tabIndex={-1} 
                            _hover={{color:"white"}} 
                            icon={<AiOutlineAlignRight size={20}/>}/>
                    </ButtonGroup>
                
                {/* <ButtonGroup
                    alignItems={"center"}
                    className="list"
                    variant={"outline"}
                    color={"gray.400"}
                    isAttached={true}
                    h={"100%"}
                >
                        <IconButton 
                            aria-label="ordered list" 
                            onClick={()=> editor?.chain().focus().toggleOrderedList().run()}
                            h={"50%"} 
                            tabIndex={-1} 
                            _hover={{color:"white"}} 
                            icon={<AiOutlineOrderedList size={20}/>}/>
                        <IconButton 
                            aria-label="unordered list" 
                            onClick={()=> editor?.chain().focus().toggleBulletList().run()}
                            h={"50%"} 
                            tabIndex={-1} 
                            _hover={{color:"white"}} 
                            icon={<AiOutlineUnorderedList size={20}/>}/>
                </ButtonGroup> */}
            </Box>

            <Box 
                overflow={'hidden scroll'} 
                w='75%'
                h='calc(100vh - 15rem)' 
                textColor='white' 
                bg='gray.900'
                roundedTop={"md"}
                boxShadow={"dark-lg"}
                p={6}
                cursor={'text'}
                onClick={()=> editor?.chain().focus().run()}>
                <EditorContent editor={editor}/>
            </Box>
        </Center>
    )
}

export default Tiptap
