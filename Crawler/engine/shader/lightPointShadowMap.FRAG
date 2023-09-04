#version 330
in vec3 WorldPos;

uniform vec3 cameraPosition;
//uniform float far_plane;

void main()
{
    vec3 LightToVertex = WorldPos - cameraPosition;
    float LightToPixelDistance = length(LightToVertex);
    gl_FragDepth = LightToPixelDistance / 15.0;
} 