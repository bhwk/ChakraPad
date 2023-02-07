import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Box, Button, Center, ButtonGroup, IconButton} from "@chakra-ui/react";
import {AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight, AiOutlineOrderedList, AiOutlineUnorderedList} from 'react-icons/ai'
import {readTextFile, writeTextFile} from '@tauri-apps/api/fs'
import {open, save} from '@tauri-apps/api/dialog'
import {listen} from '@tauri-apps/api/event'
import React, { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { write, writeFile } from "fs";

const Tiptap =  () => {
    const [currentFile, setCurrentFile] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPayload, setMenuPayload] = useState("")
    const editor= useEditor({
        extensions: [
            StarterKit,
        ],
        enableInputRules: false,
        content: '',
    })

    useEffect(()=> {
        listen("menu-event", (event) => {
            setMenuPayload(event.payload.toString())
            setMenuOpen(true)
        });
    }, []);

    useEffect(()=> {
        if (menuOpen) {
            switch(menuPayload) {
                case "save-event":
                    saveFile();
                    break;
                case "open-event":
                    openFile();
                    break;
                default:
                    break;
            };
            setMenuOpen(false)
        };
    }, [menuOpen]);

    async function openFile() {
        try {
            let filepath;
            if (currentFile) {
                filepath = await open({defaultPath: currentFile});
            } else {
                filepath = await open();
                setCurrentFile(filepath.toString())
            }
            let content = await readTextFile(filepath.toString());
            editor?.commands.setContent(JSON.parse(content));
        }   catch(e) {
            console.log(e)
        }
    };
    
    async function saveFile() {
        try {
            let filepath;
            if (currentFile) {
                filepath = await save({defaultPath: currentFile});
            } else {
                filepath = await save();
                setCurrentFile(filepath.toString())
            }
            await writeTextFile({contents: JSON.stringify(editor?.getJSON()), path: filepath});
            console.log(JSON.stringify(editor?.getJSON()))
        } catch(err) {
            console.log(err);
        }
    }
    
    return(
        <Center display={'flex'} flexDirection='column' minW='0' minH='0' maxH={'100vh'} h='100vh' gap={8} bg='gray.600'>
            <Button onClick={()=> console.log(editor?.getText())}>Save test</Button>
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
                        <IconButton h={"50%"} tabIndex={-1} aria-label="align left" _hover={{color:"white"}} icon={<AiOutlineAlignLeft size={20}/>}/>
                        <IconButton h={"50%"} tabIndex={-1} aria-label="align center" _hover={{color:"white"}} icon={<AiOutlineAlignCenter size={20}/>}/>
                        <IconButton h={"50%"} tabIndex={-1} aria-label="align right" _hover={{color:"white"}} icon={<AiOutlineAlignRight size={20}/>}/>
                    </ButtonGroup>
                
                <ButtonGroup
                    alignItems={"center"}
                    className="list"
                    variant={"outline"}
                    color={"gray.400"}
                    isAttached={true}
                    h={"100%"}
                >
                        <IconButton h={"50%"} tabIndex={-1} aria-label="ordered list" _hover={{color:"white"}} icon={<AiOutlineOrderedList size={20}/>}/>
                        <IconButton h={"50%"} tabIndex={-1} aria-label="unordered list" _hover={{color:"white"}} icon={<AiOutlineUnorderedList size={20}/>}/>
                </ButtonGroup>
            </Box>

            <Box 
                overflow={'hidden scroll'} 
                w='75%'
                h='100%' 
                textColor='white' 
                bg='gray.900'
                roundedTop={"md"}
                boxShadow={"dark-lg"}
                p={6}
                onClick={()=> editor?.chain().focus().run()}>
                <EditorContent editor={editor}/>
            </Box>
        </Center>
    )
}

export default Tiptap
