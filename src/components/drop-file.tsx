"use client"
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'

export default function Filezone() {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
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
                        <p>Drag 'n' drop some files here, or click to select files</p>
                }
            </CardContent>
            <CardFooter />
        </Card>
    )
}