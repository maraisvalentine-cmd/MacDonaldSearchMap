package __PACKAGE__.shared.cucumber.rest;

public record MultipartPart(String controlName, String fileName, String mimeType, byte[] content) {}
