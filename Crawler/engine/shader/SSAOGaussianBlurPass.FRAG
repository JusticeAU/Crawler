#version 330 core
out float FragColor;
  
in vec2 _TexCoords;

uniform sampler2D image;
  
uniform bool horizontal;
uniform float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main()
{             
    vec2 tex_offset = 1.0 / textureSize(image, 0); // gets size of single texel
    float result = texture(image, _TexCoords).r * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, _TexCoords + vec2(tex_offset.x * i, 0.0)).r * weight[i];
            result += texture(image, _TexCoords - vec2(tex_offset.x * i, 0.0)).r * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, _TexCoords + vec2(0.0, tex_offset.y * i)).r * weight[i];
            result += texture(image, _TexCoords - vec2(0.0, tex_offset.y * i)).r * weight[i];
        }
    }
    FragColor = result;
}