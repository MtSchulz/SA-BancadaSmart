//------------------------------------------------------------------------------------------
// Atualização de Eventos do Backend para o Frontend utilizando SSE - Server Sent Events
// Curso Técnico em Desenvolvimento de Sistemas - SENAI Timbó -SC
// UC: Desenvolvimento de Sistemas
// Docente: Gerson Trindade         SET-2024
//------------------------------------------------------------------------------------------
package com.clpmonitor.clpmonitor.Util;

public class TagValueParser {

    public static Object parseValue(String value, String type) {
        try {
            return switch (type.toUpperCase()) {
                case "INTEGER" -> Integer.parseInt(value);
                case "FLOAT" -> Float.parseFloat(value);
                case "BYTE" -> Byte.parseByte(value);
                case "BIT" -> Boolean.parseBoolean(value);
                case "STRING" -> value;
                case "BLOCK" -> hexStringToByteArray(value);
                default -> throw new IllegalArgumentException("Tipo de dado não suportado: " + type);
            };
        } catch (Exception e) {
            throw new RuntimeException("Erro ao converter valor: " + value + " para o tipo: " + type, e);
        }
    }
    
    private static byte[] hexStringToByteArray(String hexString) {
        if (hexString == null || hexString.length() % 2 != 0) {
            throw new IllegalArgumentException("String hexadecimal inválida");
        }
        
        byte[] byteArray = new byte[hexString.length() / 2];
        for (int i = 0; i < hexString.length(); i += 2) {
            String hexPair = hexString.substring(i, i + 2);
            byteArray[i / 2] = (byte) Integer.parseInt(hexPair, 16);
        }
        return byteArray;
    }
}
