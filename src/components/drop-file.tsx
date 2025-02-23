"use client"
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'

export default function Filezone() {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            console.log(acceptedFiles);
        }
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <Card {...getRootProps()}>
            <CardHeader />
            <CardContent>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
                }
            </CardContent>
            <CardFooter />
        </Card>
    )
}