package com.smartquiz.practice.util

import android.content.ContentResolver
import android.content.ContentValues
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import java.io.OutputStream

object PdfExport {
    fun exportSolution(
        resolver: ContentResolver,
        uri: Uri,
        chapter: String,
        topic: String,
        problem: String,
        steps: List<String>,
        finalAnswer: String,
        date: String
    ): Result<Unit> = runCatching {
        val document = PdfDocument()
        val pageWidth = 595
        val pageHeight = 842
        var pageNumber = 1
        var page = document.startPage(PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create())
        var canvas = page.canvas
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.textSize = 22f
        paint.isFakeBoldText = true
        var y = 55f
        canvas.drawText("JamsBox QT", 40f, y, paint)
        paint.textSize = 16f
        y += 34f
        canvas.drawText("MATH SOLUTION", 40f, y, paint)
        paint.textSize = 12f
        paint.isFakeBoldText = false
        y += 30f

        fun line(text: String) {
            val maxChars = 82
            val chunks = text.chunked(maxChars)
            for (chunk in chunks) {
                if (y > pageHeight - 55) {
                    document.finishPage(page)
                    pageNumber++
                    page = document.startPage(PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create())
                    canvas = page.canvas
                    y = 45f
                }
                canvas.drawText(chunk, 40f, y, paint)
                y += 18f
            }
        }

        paint.isFakeBoldText = true
        line("Chapter: $chapter")
        line("Topic: $topic")
        line("Date: $date")
        y += 8f
        line("Problem:")
        paint.isFakeBoldText = false
        line(problem)
        y += 8f
        paint.isFakeBoldText = true
        line("Step-by-Step Solution:")
        paint.isFakeBoldText = false
        steps.forEachIndexed { i, step -> line("${i + 1}. $step") }
        y += 8f
        paint.isFakeBoldText = true
        line("Final Answer:")
        paint.isFakeBoldText = false
        line(finalAnswer)

        document.finishPage(page)
        resolver.openOutputStream(uri)?.use { document.writeTo(it) } ?: error("Unable to open output file")
        document.close()
    }

    fun createDownloadsUri(resolver: ContentResolver, fileName: String): Uri? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, fileName)
            put(MediaStore.Downloads.MIME_TYPE, "application/pdf")
            put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
        }
        return resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
    }
}
